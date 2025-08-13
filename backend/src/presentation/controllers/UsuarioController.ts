import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
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
    // Função utilitária para remover imagem do sistema de arquivos
    private removeImageFile(imagemUrl: string): void {
        if (imagemUrl && !imagemUrl.startsWith('http')) {
            try {
                // Limpar a imagemUrl removendo barras extras
                let cleanUrl = imagemUrl;
                if (cleanUrl.startsWith('/uploads/')) {
                    cleanUrl = cleanUrl.replace('/uploads/', '');
                } else if (cleanUrl.startsWith('uploads/')) {
                    cleanUrl = cleanUrl.replace('uploads/', '');
                }
                
                const imagePath = path.join(__dirname, '../../../uploads', cleanUrl);

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`✓ Imagem removida: ${path.basename(imagePath)}`);
                } else {
                    console.log(`✗ Arquivo não encontrado: ${path.basename(imagePath)}`);
                }
            } catch (error) {
                console.error('Erro ao remover imagem:', error);
                // Não falhar a operação se não conseguir apagar a imagem
            }
        }
    }    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
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

            // Buscar o usuário antes de deletar para obter a imagem
            const userToDelete = await getUsuarioUseCase.execute(id, req.user!.idPerfil);

            // Executar a deleção do usuário
            await deleteUsuarioUseCase.execute(id, req.user!.idPerfil);

            // Remover imagem se existir
            if (userToDelete?.imagemUrl) {
                this.removeImageFile(userToDelete.imagemUrl);
            }

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

    async uploadImage(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
                return;
            }

            const userId = parseInt(req.params.id);

            // Verificar se o usuário pode atualizar esta imagem
            if (req.user!.idPerfil !== 1 && req.user!.id !== userId) {
                res.status(403).json({ error: 'Sem permissão para atualizar imagem de outro usuário' });
                return;
            }

            // Buscar o usuário atual para obter a imagem anterior
            const currentUser = await getUsuarioUseCase.execute(userId, req.user!.idPerfil);

            // Remover imagem anterior se existir
            if (currentUser?.imagemUrl) {
                this.removeImageFile(currentUser.imagemUrl);
            }

            // Construir URL da nova imagem
            const imageUrl = `/uploads/${req.file.filename}`;

            // Atualizar apenas a imagemUrl no banco
            const updatedUsuario = await updateUsuarioUseCase.execute(
                userId,
                { imagemUrl: imageUrl },
                req.user!.idPerfil,
                req.user!.id
            );

            res.json({
                message: 'Imagem enviada com sucesso',
                imagemUrl: imageUrl,
                usuario: updatedUsuario
            });
        } catch (error: any) {
            console.error('❌ Erro no upload:', error);
            res.status(400).json({ error: error.message });
        }
    }
}
