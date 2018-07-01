import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiarioSelecionaComponent } from './diario-seleciona.component';

describe('DiarioSelecionaComponent', () => {
  let component: DiarioSelecionaComponent;
  let fixture: ComponentFixture<DiarioSelecionaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiarioSelecionaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiarioSelecionaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
