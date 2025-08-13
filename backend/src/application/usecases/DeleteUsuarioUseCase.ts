import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';

export class DeleteUsuarioUseCase {
    constructor(private usuarioRepository: IUsuarioRepository) { }

    async execute(id: number, userPerfilId: number): Promise<void> {
        // Apenas administradores podem deletar usuários
        if (userPerfilId !== 1) {
            throw new Error('Acesso negado. Apenas administradores podem deletar usuários.');
        }

        const usuario = await this.usuarioRepository.findById(id);
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        // Não permitir deletar o próprio usuário
        if (id === userPerfilId) {
            throw new Error('Não é possível deletar seu próprio usuário');
        }

        await this.usuarioRepository.delete(id);
    }
}
