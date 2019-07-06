export class CategoriasCascata {
    categoria_id: number;
    categoria_ordem: number;
    categoria_nome: string;
    categoria_description: string;
    categoria_filhos: number;
    diario_uid: string;
    subcategorias: Subcategorias[];
}
export class Subcategorias {
    subcategoria_is: boolean;
    subcategoria_id: number;
    subcategoria_nome: string;
    subcategoria_description: string;
    subcategoria_carry: number;
    subcategoria_ordem: number;
    subcategoria_ultima: boolean;
}
