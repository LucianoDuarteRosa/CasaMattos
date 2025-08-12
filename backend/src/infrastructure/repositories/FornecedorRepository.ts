import { IFornecedorRepository } from '../../domain/repositories/IFornecedorRepository';
import { IFornecedor } from '../../domain/entities/Fornecedor';
import FornecedorModel from '../database/models/FornecedorModel';

export class FornecedorRepository implements IFornecedorRepository {
    async create(fornecedor: Omit<IFornecedor, 'id'>): Promise<IFornecedor> {
        const novoFornecedor = await FornecedorModel.create(fornecedor);
        return novoFornecedor.toJSON() as IFornecedor;
    }

    async findById(id: number): Promise<IFornecedor | null> {
        const fornecedor = await FornecedorModel.findByPk(id);
        return fornecedor ? fornecedor.toJSON() as IFornecedor : null;
    }

    async findAll(): Promise<IFornecedor[]> {
        const fornecedores = await FornecedorModel.findAll({
            order: [['razaoSocial', 'ASC']]
        });
        return fornecedores.map((fornecedor: any) => fornecedor.toJSON() as IFornecedor);
    }

    async update(id: number, data: Partial<IFornecedor>): Promise<IFornecedor | null> {
        const fornecedor = await FornecedorModel.findByPk(id);
        if (!fornecedor) {
            return null;
        }

        await fornecedor.update(data);
        return fornecedor.toJSON() as IFornecedor;
    }

    async delete(id: number): Promise<boolean> {
        const rowsAffected = await FornecedorModel.destroy({ where: { id } });
        return rowsAffected > 0;
    }

    async findByCNPJ(cnpj: string): Promise<IFornecedor | null> {
        const fornecedor = await FornecedorModel.findOne({
            where: { cnpj }
        });
        return fornecedor ? fornecedor.toJSON() as IFornecedor : null;
    }
}
