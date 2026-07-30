import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesForm } from './expenses-form';

describe('ExpensesForm', () => {
  let component: ExpensesForm;
  let fixture: ComponentFixture<ExpensesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
