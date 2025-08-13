import { IUsuario } from '../../domain/entities/Usuario';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
const bcrypt = require('bcrypt');

interface CreateUsuarioRequest {
    nomeCompleto: string;
    nickname: string;
    email: string;
    telefone?: string;
    senha: string;
    idPerfil: number;
    imagemUrl?: string;
}

export class CreateUsuarioUseCase {
    constructor(private usuarioRepository: IUsuarioRepository) { }

    async execute(request: CreateUsuarioRequest, userPerfilId: number): Promise<IUsuario> {
        // Apenas administradores podem criar usuários
        if (userPerfilId !== 1) {
            throw new Error('Acesso negado. Apenas administradores podem criar usuários.');
        }

        // Verificar se o email já existe
        const existingUser = await this.usuarioRepository.findByEmail(request.email);
        if (existingUser) {
            throw new Error('Email já está em uso');
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(request.senha, 10);

        const usuarioData = {
            nomeCompleto: request.nomeCompleto,
            nickname: request.nickname,
            email: request.email,
            telefone: request.telefone,
            senha: hashedPassword,
            ativo: true,
            idPerfil: request.idPerfil,
            imagemUrl: request.imagemUrl
        };

        return await this.usuarioRepository.create(usuarioData);
    }
}
