import { Component, OnInit, ViewChild, Inject} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTable, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { HttpClientService } from '../../servicos/comunicacao/http_client.service';
import { UserService } from '../../servicos/user/user.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { CategoriasTabularList } from '../../data-model/categoria-tabular-list';
import { CategoriaMove, SubcategoriaMove } from '../../data-model/categoria-move';



export interface DialogData {
  categoria_id: string;
  categorias: CategoriasTabularList[];
}

export interface SubDialogData {
  subcategoria_id: string;
  categoria_id: string;
  subcategorias: CategoriasTabularList[];
}


@Component({
  selector: 'app-categorias-list',
  templateUrl: './categorias-list.component.html',
  styleUrls: ['./categorias-list.component.css']
})
export class CategoriasListComponent implements OnInit {
  categoriasColumns: string[] = ['select', 'group', 'categoria_nome', 'categoria_description', 'categoria_acao'];
  subcategoriasColumns: string[] = ['select', 'group', 'subcategoria_nome', 'subcategoria_description', 'subcategoria_acao'];
  dataSource = new MatTableDataSource<CategoriasTabularList>([]);
  selection = new SelectionModel<CategoriasTabularList>(true, []);
  categoria_id: boolean[] = [];
  @ViewChild(MatTable) table: MatTable<any>;

  isSubcategoria = (index: number, row: CategoriasTabularList) => {
    return row.subcategoria_is;
  }
  hasChild = (index: number, row: CategoriasTabularList) => {
    if (row.categoria_filhos > 0) {
      return true;
    } else {
      return false;
    }
  }
  isLastSubcategoria = (index: number, row: CategoriasTabularList) => {
    return row.subcategoria_ultima && row.subcategoria_is;
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  numeroSelecionados() {
    return this.selection.selected.length;
  }

  toggleGrupo(categoria_id: number) {
    event.stopPropagation();
    this.categoria_id[categoria_id] = !this.categoria_id[categoria_id];
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }
  constructor(private http: HttpClientService,
    private userService: UserService, public dialog: MatDialog) { }

  openDialog(categoria_id: string): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(CategoriasEditComponent, {
      width: '500px',
      data: {categoria_id: categoria_id, categorias: this.dataSource.data}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        window.location.reload();
      }
    });
  }

  openSubDialog(subcategoria_id: string, categoria_id: string): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(SubcategoriasEditComponent, {
      width: '500px',
      data: {subcategoria_id: subcategoria_id, categoria_id: categoria_id, subcategorias: this.dataSource.data}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        window.location.reload();
      }
    });
  }


  ngOnInit() {
    this.userService.getUserDetail().subscribe(user => {
      this.http.categoriasTabularGet(user.userLastDiarioUID).subscribe(
        sucesso => {
          let listaCategorias = [] as CategoriasTabularList[];
          sucesso.forEach(element => {
            if (element.diario_id != null) {
              if (!element.subcategoria_is) {
                this.categoria_id[element.categoria_id] = true;
              }
              listaCategorias.push(element);
            }
          });
          this.dataSource.data = listaCategorias;
        },
        erro => {
          console.log(erro);
        });
    });
    
  }

  DeleteSelected() {
    this.selection.selected.forEach(element => {
      this.deletaItem(element);
    });
  }
  
  deletaItem(item: CategoriasTabularList) {
    if (item.subcategoria_is) {
      const index = this.dataSource.data.indexOf(item);
      if (index !== -1) {
        this.dataSource.data.forEach(element => {
          if (!element.subcategoria_is && element.categoria_id === item.categoria_id) {
            element.categoria_filhos--;
          }
        });
        this.dataSource.data.splice(index, 1);
        this.http.subcategoriaDelete(item.subcategoria_id.toString()).subscribe(null, erro => console.log (erro));
      }
    } else {
      const index = this.dataSource.data.indexOf(item);
      if (index !== -1) {
        this.dataSource.data.splice(index, +item.categoria_filhos + 1);   
        this.http.categoriaDelete(item.categoria_id.toString()).subscribe(null, erro => console.log (erro));     
      }
    }
    this.table.renderRows();
  }

}


@Component({
  selector: 'app-categorias-edit',
  templateUrl: 'categorias-edit-dialog.html',
})

export class CategoriasEditComponent implements OnInit {
  formCategorias = new FormGroup({
    categoriaNome: new FormControl(''),
    categoriaDescricao: new FormControl(''),
    categoriaNovaOrdem: new FormControl('')
  });
  categoriaOrdemAtual: number;
  listaSubcategorias: CategoriasTabularList[] = [];
  listaCategorias: CategoriasTabularList[] = [];

  constructor(
    public dialogRef: MatDialogRef<CategoriasEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClientService,
    private userService: UserService,
    private formBuilder: FormBuilder) {
      this.createForm();
    }

  ngOnInit() {
    this.listaCategorias.push();
    this.listaSubcategorias.push();
    this.data.categorias.forEach(element => {
      if (element.subcategoria_is) {
        this.listaSubcategorias.push(element);
      } else {
        this.listaCategorias.push(element);
      }
    });
    if (this.data.categoria_id !== 'new') {
      this.listaCategorias.forEach(element => {
        if (element.categoria_id.toString() ===  this.data.categoria_id) {
          this.formCategorias.patchValue({
            categoriaNome: element.categoria_nome,
            categoriaDescricao: element.categoria_description,
            categoriaNovaOrdem: +element.categoria_ordem
          });
          this.categoriaOrdemAtual = element.categoria_ordem;
        }
      });
    }
  }


  private createForm() {
    this.formCategorias = this.formBuilder.group({
      categoriaNome: ['', [Validators.required, Validators.minLength(2)] ],
      categoriaDescricao: ['', Validators.required],
      categoriaNovaOrdem: ['', Validators.required]
    });
    this.formCategorias.enable();
    
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  editaConta(): void {
    const categoria = new CategoriasTabularList();
    if (this.data.categoria_id === 'new') {
      // nova categoria:
        categoria.categoria_nome = this.formCategorias.get('categoriaNome').value;
        categoria.categoria_description = this.formCategorias.get('categoriaDescricao').value;
        this.userService.getUserDetail().subscribe(userDetail => {
          categoria.diario_uid = userDetail.userLastDiarioUID;
        });
    } else {
      // atualização:
      categoria.categoria_id = this.data.categoria_id;
      categoria.categoria_nome =  this.formCategorias.get('categoriaNome').value;
      categoria.categoria_description =  this.formCategorias.get('categoriaDescricao').value;
    }

    if (this.formCategorias.valid) {
      this.formCategorias.disable();
      this.http.categoriaPost(categoria).subscribe(
        sucesso => { 
          // agora vamos mover:
          const moverPara = new CategoriaMove;
          if (categoria.categoria_id === undefined) {
            moverPara.categoria_id = sucesso.categoria_id;
          } else {
            moverPara.categoria_id = +categoria.categoria_id;
          }
          moverPara.move_to = this.formCategorias.get('categoriaNovaOrdem').value;
          if (this.categoriaOrdemAtual < moverPara.move_to) {
            moverPara.move_to--;
          }
          this.http.categoriaMove(moverPara).subscribe(sucesso1 => {
            this.dialogRef.close(true);
          }, erro => {
            this.dialogRef.close(true);
          });
        },
        erro => {
          console.log (erro);
          this.formCategorias.enable();
          this.formCategorias.get('categoriaNome').setErrors({'incorrect': true});
          this.formCategorias.setErrors(Validators.requiredTrue);
        }
      );
    }
  }

}

@Component({
  selector: 'app-categorias-sub-edit',
  templateUrl: 'subcategorias-edit-dialog.html',
})

export class SubcategoriasEditComponent implements OnInit {
  formSubcategorias = new FormGroup({
    subcategoriaNome: new FormControl(''),
    subcategoriaDescricao: new FormControl(''),
    subcategoriaNovaOrdem: new FormControl(''),
    categoriaId: new FormControl(''),
    subcategoriaCarry: new FormControl('')
  });
  subcategoriaOrdemAtual: number;
  listaSubcategorias: CategoriasTabularList[] = [];
  listaCategorias: CategoriasTabularList[] = [];
  listaSubcategoriasFiltradas: CategoriasTabularList[] = [];
  
  constructor(
    public dialogRef: MatDialogRef<CategoriasEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubDialogData,
    private http: HttpClientService,
    private formBuilder: FormBuilder) {
      this.createForm();
    }

  onChange(categoria_id) {
    this.listaSubcategoriasFiltradas = this.listarsubCategorias(categoria_id);
  }

  listarsubCategorias(categoria_id: number): CategoriasTabularList[] {
    const listaFiltrada: CategoriasTabularList[] = [];
    this.data.subcategorias.forEach(element => {
      if (element.subcategoria_is) {
        if (+element.categoria_id === categoria_id) {
          listaFiltrada.push(element);
        }
      } 
    });
    return listaFiltrada;
  }

  ngOnInit() {
    this.listaCategorias.push();
    this.listaSubcategorias.push();
    this.data.subcategorias.forEach(element => {
      if (element.subcategoria_is) {
        this.listaSubcategorias.push(element);
      } else {
        this.listaCategorias.push(element);
      }
    });

    this.listaSubcategoriasFiltradas = this.listarsubCategorias(+this.data.categoria_id);

    if (this.data.subcategoria_id !== 'new') {
      this.listaSubcategorias.forEach(element => {
        if (element.subcategoria_id.toString() ===  this.data.subcategoria_id) {
          this.formSubcategorias.patchValue({
            subcategoriaNome: element.subcategoria_nome,
            subcategoriaDescricao: element.subcategoria_description,
            subcategoriaNovaOrdem: +element.subcategoria_ordem,
            categoriaId: +this.data.categoria_id,
            subcategoriaCarry: (element.subcategoria_carry == 1)
          });
          this.subcategoriaOrdemAtual = element.subcategoria_ordem;
        }
      });
    }
  }


  private createForm() {
    this.formSubcategorias = this.formBuilder.group({
      subcategoriaNome: ['', [Validators.required, Validators.minLength(2)] ],
      subcategoriaDescricao: ['', Validators.required],
      subcategoriaNovaOrdem: ['', Validators.required],
      categoriaId: ['', Validators.required],
      subcategoriaCarry: ['']
    });
    this.formSubcategorias.enable();
    
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  editaSubcategoria(): void {
    const subcategoria = new CategoriasTabularList();
    if (this.data.subcategoria_id === 'new') {
      // nova subcategoria:
        subcategoria.subcategoria_nome = this.formSubcategorias.get('subcategoriaNome').value;
        subcategoria.subcategoria_description = this.formSubcategorias.get('subcategoriaDescricao').value;
        subcategoria.categoria_id = this.formSubcategorias.get('categoriaId').value;
        subcategoria.subcategoria_carry = this.formSubcategorias.get('subcategoryaCarry').value;
    } else {
      // atualização:
      subcategoria.subcategoria_id = this.data.subcategoria_id;
      subcategoria.subcategoria_nome =  this.formSubcategorias.get('subcategoriaNome').value;
      subcategoria.subcategoria_description =  this.formSubcategorias.get('subcategoriaDescricao').value;
      subcategoria.subcategoria_carry = this.formSubcategorias.get('subcategoriaCarry').value;
    }


    if (this.formSubcategorias.valid) {
      this.formSubcategorias.disable();
      this.http.subcategoriaPost(subcategoria).subscribe(
        sucesso => { 
          // agora vamos mover:
          const moverPara = new SubcategoriaMove;
          if (subcategoria.subcategoria_id === undefined) {
            moverPara.subcategoria_id = sucesso.subcategoria_id;
          } else {
            moverPara.subcategoria_id = +subcategoria.subcategoria_id;
          }
          moverPara.move_to = this.formSubcategorias.get('subcategoriaNovaOrdem').value;
          if (subcategoria.categoria_id !== undefined) {
            if (this.subcategoriaOrdemAtual < moverPara.move_to) {
              moverPara.move_to--;
            }
          }
          moverPara.move_to_categoria_id = this.formSubcategorias.get('categoriaId').value;
          
          this.http.subcategoriaMove(moverPara).subscribe(sucesso1 => {
            this.dialogRef.close(true);
          }, erro => {
            this.dialogRef.close(true);
          });
        },
        erro => {
          this.formSubcategorias.enable();
          this.formSubcategorias.get('subcategoriaNome').setErrors({'incorrect': true});
          this.formSubcategorias.setErrors(Validators.requiredTrue);
        }
      );
    }
  }

}
