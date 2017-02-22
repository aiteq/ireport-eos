import { Directive, ElementRef, Input, HostBinding, HostListener, OnChanges } from '@angular/core';
import { NgModel } from "@angular/forms";

@Directive({
  selector: 'input[empty], textarea[empty]'
})
export class EmptyDirective implements OnChanges {

  @Input('ngModel')
  private ngModel: any;

  @Input('empty')
  private property: string;

  @HostBinding('class.empty')
  private _empty: boolean = true;

  @HostListener('input')
  private onElementInput() {
    //console.log(this._el.nativeElement.name + ' (element): ' + this._el.nativeElement.value);
    this._empty = !this._el.nativeElement.value.length;
  }

  constructor(private _el: ElementRef) {}

  ngOnChanges(changes: any) {
    /*if (changes.ngModel) {
      this._empty = !(changes.ngModel.currentValue && changes.ngModel.currentValue)
    }*/
    if (changes.ngModel) {
      let value = this.property ? this.ngModel[this.property] : this.ngModel;
      this._empty = !(this.ngModel && value && value.length);
      //let value = this.ngModel && (this.property ? this.ngModel[this.property] : this.ngModel);
      //console.log(this._el.nativeElement.name + ' (model): ' + value);
      //value = changes.ngModel && (this.property ? changes.ngModel[this.property] : changes.ngModel);
      //console.log(this._el.nativeElement.name + ' (event): ' + value);
    }
  }
}