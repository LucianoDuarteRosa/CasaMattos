import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';
import { IUsuario } from '../../domain/entities/Usuario';
import UsuarioModel from '../database/models/UsuarioModel';

export class UsuarioRepository implements IUsuarioRepository {
    async create(usuario: Omit<IUsuario, 'id'>): Promise<IUsuario> {
        const result = await UsuarioModel.create(usuario);
        return this.toEntity(result);
    }

    async findById(id: number): Promise<IUsuario | null> {
        const result = await UsuarioModel.findByPk(id);
        return result ? this.toEntity(result) : null;
    }

    async findAll(): Promise<IUsuario[]> {
        const results = await UsuarioModel.findAll({
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

    private toEntity(model: UsuarioModel): IUsuario {
        return {
            id: model.id,
            nomeCompleto: model.nomeCompleto,
            nickname: model.nickname,
            email: model.email,
            telefone: model.telefone,
            senha: model.senha,
            ativo: model.ativo,
            idPerfil: model.idPerfil,
            imagemUrl: model.imagemUrl,
            createdAt: model.createdAt,
            updatedAt: model.updatedAt,
        };
    }
}
