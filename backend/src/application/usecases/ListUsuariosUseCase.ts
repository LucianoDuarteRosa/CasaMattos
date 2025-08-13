import { IUsuario } from '../../domain/entities/Usuario';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';

export class ListUsuariosUseCase {
    constructor(private usuarioRepository: IUsuarioRepository) { }

    async execute(userPerfilId: number): Promise<IUsuario[]> {
        // Apenas administradores podem listar usuários
        if (userPerfilId !== 1) {
            throw new Error('Acesso negado. Apenas administradores podem listar usuários.');
        }

        return await this.usuarioRepository.findAll();
    }
}
