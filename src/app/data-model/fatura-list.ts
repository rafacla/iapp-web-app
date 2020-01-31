export class FaturaList {
    fatura_index: number;
    fatura_data: string;
    fatura_valor: number;
    fatura_valor_pago: number;
    conta_id: number;
    conta_nome: string;
    conta_fechamento: string;
    conta_vencimento: string;
}

export class TransacoesCartaoList {
    fatura_data: string;
    transacao_data: string;
    transacao_sacado: string;
    transacao_descricao: string;
    transacao_numero: string;
    transacao_valor: number;
    transacao_id: number;
    conta_id: number;
    subtransacoes: Subtransacoes[];
}

class Subtransacoes {
    transacoes_item_id: number;
    transacoes_item_descricao: string;
    transacoes_item_valor: number;
    subcategoria_id: number;
    transacao_id: number;
}

export class CartaoList {
    conta_id: number;
    conta_nome: string;
    conta_descricao: string;
    faturas: FaturaList[];
}
