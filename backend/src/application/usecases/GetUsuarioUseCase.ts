import { IUsuario } from '../../domain/entities/Usuario';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';

export class GetUsuarioUseCase {
    constructor(private usuarioRepository: IUsuarioRepository) { }

    async execute(id: number, userPerfilId: number): Promise<IUsuario | null> {
        // Administradores podem ver qualquer usuário
        // Operadores podem ver apenas seu próprio perfil
        if (userPerfilId !== 1 && id !== userPerfilId) {
            throw new Error('Acesso negado.');
        }

        return await this.usuarioRepository.findById(id);
    }
}
