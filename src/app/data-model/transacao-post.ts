export class TransacaoPost {
    transacao_id?: number;
    transacao_data?: string;
    transacao_sacado?: string;
    transacao_descricao?: string;
    transacao_valor?: number;
    transacao_conciliada?: boolean;
    transacao_aprovada?: boolean;
    transacao_merged_to_id?: number;
    transacao_numero?: string;
    transacao_fatura_data?: string;
    conta_id?: number;
}