import { Request, Response } from 'express';
import { CreateUsuarioUseCase } from '../../application/usecases/CreateUsuarioUseCase';
import { ListUsuariosUseCase } from '../../application/usecases/ListUsuariosUseCase';
import { GetUsuarioUseCase } from '../../application/usecases/GetUsuarioUseCase';
import { UpdateUsuarioUseCase } from '../../application/usecases/UpdateUsuarioUseCase';
import { UpdateUsuarioSenhaUseCase } from '../../application/usecases/UpdateUsuarioSenhaUseCase';
import { DeleteUsuarioUseCase } from '../../application/usecases/DeleteUsuarioUseCase';
import { UsuarioRepository } from '../../infrastructure/repositories/UsuarioRepository';

const usuarioRepository = new UsuarioRepository();
const createUsuarioUseCase = new CreateUsuarioUseCase(usuarioRepository);
const listUsuariosUseCase = new ListUsuariosUseCase(usuarioRepository);
const getUsuarioUseCase = new GetUsuarioUseCase(usuarioRepository);
const updateUsuarioUseCase = new UpdateUsuarioUseCase(usuarioRepository);
const updateUsuarioSenhaUseCase = new UpdateUsuarioSenhaUseCase(usuarioRepository);
const deleteUsuarioUseCase = new DeleteUsuarioUseCase(usuarioRepository);

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        idPerfil: number;
        email: string;
    };
}

export class UsuarioController {
    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const usuario = await createUsuarioUseCase.execute(req.body, req.user!.idPerfil);

            // Remove senha do retorno
            const { senha, ...usuarioSemSenha } = usuario;
            res.status(201).json(usuarioSemSenha);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async list(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const usuarios = await listUsuariosUseCase.execute(req.user!.idPerfil);

            // Remove senhas do retorno
            const usuariosSemSenha = usuarios.map(({ senha, ...usuario }) => usuario);
            res.json(usuariosSemSenha);
        } catch (error: any) {
            res.status(403).json({ error: error.message });
        }
    }

    async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const usuario = await getUsuarioUseCase.execute(id, req.user!.idPerfil);

            if (!usuario) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }

            // Remove senha do retorno
            const { senha, ...usuarioSemSenha } = usuario;
            res.json(usuarioSemSenha);
        } catch (error: any) {
            res.status(403).json({ error: error.message });
        }
    }

    async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const usuario = await updateUsuarioUseCase.execute(id, req.body, req.user!.idPerfil, req.user!.id);

            // Remove senha do retorno
            const { senha, ...usuarioSemSenha } = usuario;
            res.json(usuarioSemSenha);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async updatePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            await updateUsuarioSenhaUseCase.execute(id, req.body, req.user!.idPerfil, req.user!.id);

            res.json({ message: 'Senha alterada com sucesso' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            await deleteUsuarioUseCase.execute(id, req.user!.idPerfil);

            res.json({ message: 'Usuário deletado com sucesso' });
        } catch (error: any) {
            res.status(403).json({ error: error.message });
        }
    }

    async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const usuario = await getUsuarioUseCase.execute(req.user!.id, req.user!.id);

            if (!usuario) {
                res.status(404).json({ error: 'Usuário não encontrado' });
                return;
            }

            // Remove senha do retorno
            const { senha, ...usuarioSemSenha } = usuario;
            res.json(usuarioSemSenha);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
