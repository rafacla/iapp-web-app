export class OrcamentoGet {
    lista_orcamentos: OrcamentoList[];
    receita_acum: number;
    receita_mes: number;
    orcado_acum: number;
    orcado_mes: number;
    sobregasto_mes_m_1: number;
    sobregasto_acum_m_1: number;
    sobregasto_acum: number;
    sobreorcado_acum_m_1: number;
    gastos_classificados_mes: number;
    gastos_classificados_acum: number;
    transacoes_sem_classificacao: number;
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
    disponivel_valor: number;
}

export class OrcamentoPost {
    orcamento_date: string;
    orcamento_valor: number;
    diario_uid: string;
    subcategoria_id: number;
}