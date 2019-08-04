export class OrcamentoGet {
    lista_orcamentos: OrcamentoList[]
}

export class OrcamentoList {
    categoria_id: number;
    categoria_nome: string;
    categoria_description: string;
    categoria_ordem: number;
    subcategoria_is: boolean;
    subcategoria_id: number;
    subcategoria_nome: string;
    subcategoria_description: string;
    subcategoria_carry: boolean;
    subcategoria_ordem: number;
    orcamento_valor: number;
    transacoes_valor: number;
}