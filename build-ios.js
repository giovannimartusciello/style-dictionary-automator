import {Filter, Transformer, Common} from './common-builder.js';


export class iOSBuilderConfig {
  transformersGroupName = 'custom/ios-swift-separate';

  filters = [
    new Filter("isColor", 'colors', 'color'),
    new Filter("isBorderWidth", 'borders', 'dimension'),
    new Filter("isBorderRadius", 'radius', 'dimension'),
  ]

  transformers = [
    new Transformer('color/customSwiftUIColor','value',Common.isRawColor,this.makeColorSwiftUI),
    new Transformer('border/customSwiftUIBorderWidth','value',Common.isBorderWidth,this.makeValueToCGFloat),
    new Transformer('border/customSwiftUIBorderRadius','value',Common.isBorderRadius,this.makeValueToCGFloat),
  ]

  makeColorSwiftUI(token) {
    return Common.transform("color/ColorSwiftUI", token.value)
  }
  
  makeSwiftUIPxToFloat(token) {
    token.name =  Common.cleanName(token.type, token.name);
    return parseFloat(token.value).toFixed(1);
  }

  makeValueToCGFloat(token) {
    token.name =token.path.at(-1)
    var sizePxToRem = Common.transform("size/pxToRem", token.value);
    return Common.transform("size/swift/remToCGFloat", sizePxToRem);
  }
}
