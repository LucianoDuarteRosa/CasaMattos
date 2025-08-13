import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IUsuario } from '../../domain/entities/Usuario';
import UsuarioModel from '../database/models/UsuarioModel';
import PerfilModel from '../database/models/PerfilModel';

export class UsuarioRepository implements IUsuarioRepository {
    async create(usuario: Omit<IUsuario, 'id'>): Promise<IUsuario> {
        const result = await UsuarioModel.create(usuario);
        return this.toEntity(result);
    }

    async findById(id: number): Promise<IUsuario | null> {
        const result = await UsuarioModel.findByPk(id, {
            include: [{
                model: PerfilModel,
                as: 'perfil'
            }]
        });
        return result ? this.toEntity(result) : null;
    }

    async findAll(): Promise<IUsuario[]> {
        const results = await UsuarioModel.findAll({
            include: [{
                model: PerfilModel,
                as: 'perfil'
            }],
            order: [['nomeCompleto', 'ASC']]
        });
        return results.map(this.toEntity);
    }

    async update(id: number, data: Partial<IUsuario>): Promise<IUsuario | null> {
        await UsuarioModel.update(data, { where: { id } });
        const updated = await UsuarioModel.findByPk(id);
        return updated ? this.toEntity(updated) : null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await UsuarioModel.destroy({ where: { id } });
        return result > 0;
    }

    async findByEmail(email: string): Promise<IUsuario | null> {
        const result = await UsuarioModel.findOne({ where: { email } });
        return result ? this.toEntity(result) : null;
    }

    async findAtivos(): Promise<IUsuario[]> {
        const results = await UsuarioModel.findAll({
            where: { ativo: true },
            order: [['nomeCompleto', 'ASC']]
        });
        return results.map(this.toEntity);
    }

    private toEntity(model: any): IUsuario {
        return {
            id: model.id,
            nomeCompleto: model.nomeCompleto,
            nickname: model.nickname,
            email: model.email,
            telefone: model.telefone,
            senha: model.senha,
            ativo: model.ativo,
            idPerfil: model.idPerfil,
            perfil: model.perfil ? {
                id: model.perfil.id,
                nomePerfil: model.perfil.nomePerfil,
                createdAt: model.perfil.createdAt,
                updatedAt: model.perfil.updatedAt,
            } : undefined,
            imagemUrl: model.imagemUrl,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
        };
    }
}
