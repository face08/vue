// 编译参数选项
declare type CompilerOptions = {
  warn?: Function; // allow customizing warning in different environments; e.g. node    自定义警告信息
  modules?: Array<ModuleOptions>; // platform specific modules; e.g. style; class   平台指定的特殊模块
  directives?: { [key: string]: Function }; // platform specific directives   平台指定的特殊指令
  staticKeys?: string; // a list of AST properties to be considered static; for optimization
  isUnaryTag?: (tag: string) => ?boolean; // check if a tag is unary for the platform   是否一元tag
  canBeLeftOpenTag?: (tag: string) => ?boolean; // check if a tag can be left opened    是否可以left open
  isReservedTag?: (tag: string) => ?boolean; // check if a tag is a native for the platform 是否保留tag
  preserveWhitespace?: boolean; // preserve whitespace between elements?    是否保留空格
  optimize?: boolean; // optimize static content?   是否优化

  // web specific
  mustUseProp?: (tag: string, type: ?string, name: string) => boolean; // check if an attribute should be bound as a property
  isPreTag?: (attr: string) => ?boolean; // check if a tag needs to preserve whitespace   是否 == pre
  getTagNamespace?: (tag: string) => ?string; // check the namespace for a tag  获取namespace
  expectHTML?: boolean; // only false for non-web builds
  isFromDOM?: boolean;
  shouldDecodeTags?: boolean;
  shouldDecodeNewlines?:  boolean;
  shouldDecodeNewlinesForHref?: boolean;

  // runtime user-configurable
  delimiters?: [string, string]; // template delimiters   分隔符
  comments?: boolean; // preserve comments in template    是否保留注释

  // for ssr optimization compiler
  scopeId?: string;
};

// 编译结果
declare type CompiledResult = {
  ast: ?ASTElement;
  render: string;
  staticRenderFns: Array<string>; // todo
  stringRenderFns?: Array<string>;
  errors?: Array<string>;
  tips?: Array<string>;
};

declare type ModuleOptions = {
  // transform an AST node before any attributes are processed
  // returning an ASTElement from pre/transforms replaces the element
  preTransformNode: (el: ASTElement) => ?ASTElement;
  // transform an AST node after built-ins like v-if, v-for are processed
  transformNode: (el: ASTElement) => ?ASTElement;
  // transform an AST node after its children have been processed
  // cannot return replacement in postTransform because tree is already finalized
  postTransformNode: (el: ASTElement) => void;
  genData: (el: ASTElement) => string; // generate extra data string for an element
  transformCode?: (el: ASTElement, code: string) => string; // further transform generated code for an element
  staticKeys?: Array<string>; // AST properties to be considered static
};

declare type ASTModifiers = { [key: string]: boolean };
declare type ASTIfCondition = { exp: ?string; block: ASTElement };
declare type ASTIfConditions = Array<ASTIfCondition>;

declare type ASTElementHandler = {
  value: string;
  params?: Array<any>;
  modifiers: ?ASTModifiers;
};

declare type ASTElementHandlers = {
  [key: string]: ASTElementHandler | Array<ASTElementHandler>;
};

declare type ASTDirective = {
  name: string;
  rawName: string;
  value: string;
  arg: ?string;
  modifiers: ?ASTModifiers;
};

declare type ASTNode = ASTElement | ASTText | ASTExpression;

// 语法抽象树
declare type ASTElement = {
  type: 1;
  tag: string;
  attrsList: Array<{ name: string; value: any }>;
  attrsMap: { [key: string]: any };
  parent: ASTElement | void;
  children: Array<ASTNode>;

  processed?: true;

  static?: boolean;
  staticRoot?: boolean;
  staticInFor?: boolean;
  staticProcessed?: boolean;
  hasBindings?: boolean;

  text?: string;
  attrs?: Array<{ name: string; value: any }>;
  props?: Array<{ name: string; value: string }>;
  plain?: boolean;
  pre?: true;
  ns?: string;

  component?: string;
  inlineTemplate?: true;
  transitionMode?: string | null;
  slotName?: ?string;
  slotTarget?: ?string;
  slotScope?: ?string;
  scopedSlots?: { [name: string]: ASTElement };

  ref?: string;
  refInFor?: boolean;

  // if指令
  if?: string;
  ifProcessed?: boolean;
  elseif?: string;
  else?: true;
  ifConditions?: ASTIfConditions;

  // for指令
  for?: string;
  forProcessed?: boolean;
  key?: string;
  alias?: string;
  iterator1?: string;
  iterator2?: string;

  staticClass?: string;     // 静态class
  classBinding?: string;    // 绑定class
  staticStyle?: string;
  styleBinding?: string;
  events?: ASTElementHandlers;
  nativeEvents?: ASTElementHandlers;

  transition?: string | true;
  transitionOnAppear?: boolean;

  model?: {
    value: string;
    callback: string;
    expression: string;
  };

  directives?: Array<ASTDirective>;

  forbidden?: true;
  once?: true;
  onceProcessed?: boolean;
  wrapData?: (code: string) => string;
  wrapListeners?: (code: string) => string;

  // 2.4 ssr optimization
  ssrOptimizability?: number;

  // weex specific
  appendAsTree?: boolean;
};

// 表达式
declare type ASTExpression = {
  type: 2;
  expression: string;
  text: string;
  tokens: Array<string | Object>;
  static?: boolean;
  // 2.4 ssr optimization
  ssrOptimizability?: number;
};

// 文本
declare type ASTText = {
  type: 3;
  text: string;
  static?: boolean;
  isComment?: boolean;
  // 2.4 ssr optimization
  ssrOptimizability?: number;
};

// SFC-parser related declarations

// an object format describing a single-file component
declare type SFCDescriptor = {
  template: ?SFCBlock;
  script: ?SFCBlock;
  styles: Array<SFCBlock>;
  customBlocks: Array<SFCBlock>;
};

declare type SFCBlock = {
  type: string;
  content: string;
  attrs: {[attribute:string]: string};
  start?: number;
  end?: number;
  lang?: string;
  src?: string;
  scoped?: boolean;
  module?: string | boolean;
};
