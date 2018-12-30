export class SubtransacoesTabular {
    transacao_id: number;
    transacao_data: string;
    transacao_sacado: string;
    transacao_descricao: string;
    transacao_valor: number;
    transacao_conciliada: true;
    transacao_aprovada: true;
    transacao_merged_to_id: number;
    conta_id: number;
    conta_nome: string;
    diario_uid: string;
    transacoes_item_id: number;
    transacoes_item_descricao: string;
    transacoes_item_valor: number;
    categoria_id: number;
    categoria_nome: string;
    subcategoria_id: number;
    subcategoria_nome: string;
    transf_para_conta_id: number;
    transf_para_conta_nome: string;
    transf_para_tipo: string;
}
