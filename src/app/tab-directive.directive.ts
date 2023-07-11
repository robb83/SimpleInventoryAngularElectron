import {
  Directive,
  AfterViewInit,
  OnDestroy,
  Optional
} from '@angular/core';
import {
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';


@Directive({
  selector: '[tab-directive]'
})
export class TabDirective implements AfterViewInit, OnDestroy {
  observable: any;
  constructor(@Optional() private autoTrigger: MatAutocompleteTrigger) {}
  ngAfterViewInit() {
      this.observable = this.autoTrigger.panelClosingActions.subscribe(x => {
          if (this.autoTrigger.activeOption) {
              this.autoTrigger.writeValue(this.autoTrigger.activeOption.value)
          }
      })
  }
  ngOnDestroy() {
      this.observable.unsubscribe();
  }
}