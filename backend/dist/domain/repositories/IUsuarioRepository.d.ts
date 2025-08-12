import { IUsuario } from '../entities/Usuario';
export interface IUsuarioRepository {
    create(usuario: Omit<IUsuario, 'id'>): Promise<IUsuario>;
    findById(id: number): Promise<IUsuario | null>;
    findAll(): Promise<IUsuario[]>;
    update(id: number, data: Partial<IUsuario>): Promise<IUsuario | null>;
    delete(id: number): Promise<boolean>;
    findByEmail(email: string): Promise<IUsuario | null>;
    findAtivos(): Promise<IUsuario[]>;
}
//# sourceMappingURL=IUsuarioRepository.d.ts.map