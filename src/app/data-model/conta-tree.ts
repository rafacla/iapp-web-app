class Children {
    id: number
    name: string
    saldo: number;
    level: number;
}

export class ContaTree {
    name: string;
    saldo: number;
    level: number;
    children: Children[];

    constructor(name: string) {
        this.name = name;
        this.saldo = 0;
        this.level = 1;
        this.children = []
    }

    addItem(id: number, name: string, saldo: number) {
        this.saldo += saldo;
        let newChild = new Children();
        newChild.id = id;
        newChild.name = name;
        newChild.saldo = saldo;
        newChild.level = 2;
        this.children.push(newChild); 
    }
}