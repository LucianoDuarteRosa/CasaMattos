import { IUsuario } from '../../domain/entities/Usuario';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';

interface UpdateUsuarioRequest {
    nomeCompleto?: string;
    nickname?: string;
    email?: string;
    telefone?: string;
    ativo?: boolean;
    idPerfil?: number;
    imagemUrl?: string;
}

export class UpdateUsuarioUseCase {
    constructor(private usuarioRepository: IUsuarioRepository) { }

    async execute(id: number, request: UpdateUsuarioRequest, userPerfilId: number, userId: number): Promise<IUsuario> {
        // Administradores podem atualizar qualquer usuário
        // Operadores podem atualizar apenas seu próprio perfil (exceto perfil e status ativo)
        if (userPerfilId !== 1 && id !== userId) {
            throw new Error('Acesso negado.');
        }

        // Se é operador, remover campos que não pode alterar
        if (userPerfilId !== 1) {
            delete request.ativo;
            delete request.idPerfil;
        }

        const usuario = await this.usuarioRepository.findById(id);
        if (!usuario) {
            throw new Error('Usuário não encontrado');
        }

        // Se está alterando email, verificar se já existe
        if (request.email && request.email !== usuario.email) {
            const existingUser = await this.usuarioRepository.findByEmail(request.email);
            if (existingUser) {
                throw new Error('Email já está em uso');
            }
        }

        // Atualizar diretamente com os dados enviados - o frontend agora sempre envia a imagemUrl correta
        const updatedUser = await this.usuarioRepository.update(id, request);
        if (!updatedUser) {
            throw new Error('Erro ao atualizar usuário');
        }

        return updatedUser;
    }
}
