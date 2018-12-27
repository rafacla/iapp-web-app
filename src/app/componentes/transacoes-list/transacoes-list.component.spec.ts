import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransacoesListComponent } from './transacoes-list.component';

describe('TransacoesListComponent', () => {
  let component: TransacoesListComponent;
  let fixture: ComponentFixture<TransacoesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransacoesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransacoesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
