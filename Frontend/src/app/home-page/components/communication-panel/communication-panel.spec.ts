import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationPanel } from './communication-panel';

describe('CommunicationPanel', () => {
  let component: CommunicationPanel;
  let fixture: ComponentFixture<CommunicationPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
