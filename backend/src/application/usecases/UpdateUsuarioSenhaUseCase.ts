import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';

interface UpdateUsuarioSenhaRequest {
    senhaAtual: string;
    novaSenha: string;
}

export class UpdateUsuarioSenhaUseCase {
    constructor(private usuarioRepository: IUsuarioRepository) { }

    async execute(id: number, request: UpdateUsuarioSenhaRequest, userPerfilId: number, userId: number): Promise<void> {
        // Administradores podem alterar senha de qualquer operador
        // Operadores podem alterar apenas sua própria senha
        if (userPerfilId !== 1 && id !== userId) {
            throw new Error('Acesso negado.');
        }

        const usuario = await this.usuarioRepository.findById(id);
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        // Se é operador alterando própria senha ou admin alterando senha de operador
        const bcrypt = require('bcrypt');

        // Verificar senha atual apenas se o usuário está alterando sua própria senha
        if (id === userId) {
            const senhaValida = await bcrypt.compare(request.senhaAtual, usuario.senha);
            if (!senhaValida) {
                throw new Error('Senha atual incorreta');
            }
        }

        // Hash da nova senha
        const novaSenhaHash = await bcrypt.hash(request.novaSenha, 10);

        await this.usuarioRepository.update(id, { senha: novaSenhaHash });
    }
}
