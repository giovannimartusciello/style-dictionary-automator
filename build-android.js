import {Filter, Transformer, Common} from './common-builder.js';


export class AndroidBuilderConfig {
  transformersGroupName = 'custom/compose';

  filters = [
    new Filter("isColor", 'color'),
    new Filter("isBorderWidth", 'dimension', 'width'),
    new Filter("isBorderRadius", 'dimension', 'radius'),
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
    token.name = token.path.at(-1)
    token.path.shift()
    var sizePxToRem = Common.transform("size/pxToRem", token.value);
    return Common.transform("size/compose/remToDp", sizePxToRem);
  }
}
