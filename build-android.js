import {Filter, Transformer, Common} from './common-builder.js';


export class AndroidBuilderConfig {
  transformersGroupName = 'custom/compose';

  filters = [
    new Filter("isColor", 'colors', 'color'),
    new Filter("isBorderWidth", 'borders', 'dimension'),
    new Filter("isBorderRadius", 'radius', 'dimension'),
  ]

  transformers = [
    new Transformer('color/customComposeColor','value',Common.isRawColor,this.makeComposeColor),
    new Transformer('border/customComposeBorderWidth','value',Common.isBorderWidth,this.makeValueToDp),
    new Transformer('border/customComposeBorderRadius','value',Common.isBorderRadius,this.makeValueToDp),
  ]

  makeComposeColor(token) {
    return Common.transform("color/composeColor", token.value)
  }

  makeValueToDp(token) {
    token.name =token.path.at(-1)
    var sizePxToRem = Common.transform("size/pxToRem", token.value);
    return Common.transform("size/compose/remToDp", sizePxToRem);
  }
}
