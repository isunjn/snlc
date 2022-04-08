import type { LexType } from "./token";

// `symbol` is a keyword in js/ts, we use `symbo` instead
// T for Terminal, N for Non-Terminal

type Symbo = T_Symbo | N_Symbo;

type T_Symbo =
  | Exclude<LexType, "COMMENT" | "WHITESPACE">
  | "EOS"
  | "EPSILON";

type N_Symbo =
  | "Program"
  | "ProgramHead"
  | "ProgramBody"
  | "ProgramName"
  | "DeclarePart"
  | "TypeDec"
  | "TypeDeclaration"
  | "TypeDecList"
  | "TypeDecMore"
  | "TypeId"
  | "TypeName"
  | "BaseType"
  | "StructureType"
  | "ArrayType"
  | "Low"
  | "Top"
  | "RecordType"
  | "FieldDecList"
  | "FieldDecMore"
  | "IdList"
  | "IdMore"
  | "VarDec"
  | "VarDeclaration"
  | "VarDecList"
  | "VarDecMore"
  | "VarIdList"
  | "VarIdMore"
  | "ProcDec"
  | "ProcDeclaration"
  | "ProcName"
  | "ParamList"
  | "ProcBody"
  | "ProcDecPart"
  | "ProcDecMore"
  | "ParamDecList"
  | "Param"
  | "ParamMore"
  | "FormList"
  | "FidMore"
  | "StmList"
  | "Stm"
  | "StmMore"
  | "ConditionalStm"
  | "LoopStm"
  | "InputStm"
  | "OutputStm"
  | "ReturnStm"
  | "AssCall"
  | "AssignmentRest"
  | "CallStmRest"
  | "Exp"
  | "RelExp"
  | "Invar"
  | "ActParamList"
  | "ActParamMore"
  | "OtherRelE"
  | "CmpOp"
  | "Term"
  | "OtherTerm"
  | "AddOp"
  | "Factor"
  | "OtherFactor"
  | "MultOp"
  | "Variable"
  | "VariMore"
  | "FieldVar"
  | "FieldVarMore";

class Rule {
  left: N_Symbo;
  right: Symbo[];

  constructor(left: N_Symbo, right: Symbo[]) {
    this.left = left;
    this.right = right;
  }
}

const grammar = new Map<number, Rule>()
  .set(1, new Rule("Program", ["ProgramHead", "DeclarePart", "ProgramBody"]))
  .set(2, new Rule("ProgramHead", ["PROGRAM", "ProgramName"]))
  .set(3, new Rule("ProgramName", ["ID"]))
  .set(4, new Rule("DeclarePart", ["TypeDec", "VarDec", "ProcDec"]))
  .set(5, new Rule("TypeDec", ["EPSILON"]))
  .set(6, new Rule("TypeDec", ["TypeDeclaration"]))
  .set(7, new Rule("TypeDeclaration", ["TYPE", "TypeDecList"]))
  .set(8, new Rule("TypeDecList", ["TypeId", "EQ", "TypeName", "SEMI", "TypeDecMore"]))
  .set(9, new Rule("TypeDecMore", ["EPSILON"]))
  .set(10, new Rule("TypeDecMore", ["TypeDecList"]))
  .set(11, new Rule("TypeId", ["ID"]))
  .set(12, new Rule("TypeName", ["BaseType"]))
  .set(13, new Rule("TypeName", ["StructureType"]))
  .set(14, new Rule("TypeName", ["ID"]))
  .set(15, new Rule("BaseType", ["INTEGER"]))
  .set(16, new Rule("BaseType", ["CHAR"]))
  .set(17, new Rule("StructureType", ["ArrayType"]))
  .set(18, new Rule("StructureType", ["RecordType"]))
  .set(19, new Rule("ArrayType", ["ARRAY", "L_SQUARE", "Low", "RANGE", "Top", "R_SQUARE" , "OF", "BaseType"]))
  .set(20, new Rule("Low", ["INTC"]))
  .set(21, new Rule("Top", ["INTC"]))
  .set(22, new Rule("RecordType", ["RECORD", "FieldDecList", "END"]))
  .set(23, new Rule("FieldDecList", ["BaseType", "IdList", "SEMI", "FieldDecMore"]))
  .set(24, new Rule("FieldDecList", ["ArrayType", "IdList", "SEMI", "FieldDecMore"]))
  .set(25, new Rule("FieldDecMore", ["EPSILON"]))
  .set(26, new Rule("FieldDecMore", ["FieldDecList"]))
  .set(27, new Rule("IdList", ["ID", "IdMore"]))
  .set(28, new Rule("IdMore", ["EPSILON"]))
  .set(29, new Rule("IdMore", ["COMMA", "IdList"]))
  .set(30, new Rule("VarDec", ["EPSILON"]))
  .set(31, new Rule("VarDec", ["VarDeclaration"]))
  .set(32, new Rule("VarDeclaration", ["VAR", "VarDecList"]))
  .set(33, new Rule("VarDecList", ["TypeName", "VarIdList", "SEMI", "VarDecMore"]))
  .set(34, new Rule("VarDecMore", ["EPSILON"]))
  .set(35, new Rule("VarDecMore", ["VarDecList"]))
  .set(36, new Rule("VarIdList", ["ID", "VarIdMore"]))
  .set(37, new Rule("VarIdMore", ["EPSILON"]))
  .set(38, new Rule("VarIdMore", ["COMMA", "VarIdList"]))
  .set(39, new Rule("ProcDec", ["EPSILON"]))
  .set(40, new Rule("ProcDec", ["ProcDeclaration"]))
  .set(41, new Rule("ProcDeclaration", ["PROCEDURE", "ProcName", "L_PAREN", "ParamList", "R_PAREN", "SEMI", "ProcDecPart", "ProcBody", "ProcDecMore"]))
  .set(42, new Rule("ProcDecMore", ["EPSILON"]))
  .set(43, new Rule("ProcDecMore", ["ProcDeclaration"]))
  .set(44, new Rule("ProcName", ["ID"]))
  .set(45, new Rule("ParamList", ["EPSILON"]))
  .set(46, new Rule("ParamList", ["ParamDecList"]))
  .set(47, new Rule("ParamDecList", ["Param", "ParamMore"]))
  .set(48, new Rule("ParamMore", ["EPSILON"]))
  .set(49, new Rule("ParamMore", ["SEMI", "ParamDecList"]))
  .set(50, new Rule("Param", ["TypeName", "FormList"]))
  .set(51, new Rule("Param", ["VAR","TypeName", "FormList"]))
  .set(52, new Rule("FormList", ["ID", "FidMore"]))
  .set(53, new Rule("FidMore", ["EPSILON"]))
  .set(54, new Rule("FidMore", ["COMMA", "FormList"]))
  .set(55, new Rule("ProcDecPart", ["DeclarePart"]))
  .set(56, new Rule("ProcBody", ["ProgramBody"]))
  .set(57, new Rule("ProgramBody", ["BEGIN", "StmList", "END"]))
  .set(58, new Rule("StmList", ["Stm", "StmMore"]))
  .set(59, new Rule("StmMore", ["EPSILON"]))
  .set(60, new Rule("StmMore", ["SEMI", "StmList"]))
  .set(61, new Rule("Stm", ["ConditionalStm"]))
  .set(62, new Rule("Stm", ["LoopStm"]))
  .set(63, new Rule("Stm", ["InputStm"]))
  .set(64, new Rule("Stm", ["OutputStm"]))
  .set(65, new Rule("Stm", ["ReturnStm"]))
  .set(66, new Rule("Stm", ["ID", "AssCall"]))
  .set(67, new Rule("AssCall", ["AssignmentRest"]))
  .set(68, new Rule("AssCall", ["CallStmRest"]))
  .set(69, new Rule("AssignmentRest", ["VariMore", "ASSIGN", "Exp"]))
  .set(70, new Rule("ConditionalStm", ["IF", "RelExp", "THEN", "StmList", "ELSE", "StmList", "FI"]))
  .set(71, new Rule("LoopStm", ["WHILE", "RelExp", "DO", "StmList", "ENDWH"]))
  .set(72, new Rule("InputStm", ["READ", "L_PAREN", "Invar", "R_PAREN"]))
  .set(73, new Rule("Invar", ["ID"]))
  .set(74, new Rule("OutputStm", ["WRITE", "L_PAREN", "Exp", "R_PAREN"]))
  .set(75, new Rule("ReturnStm", ["RETURN", "L_PAREN", "Exp", "R_PAREN"]))
  .set(76, new Rule("CallStmRest", ["L_PAREN", "ActParamList", "R_PAREN"]))
  .set(77, new Rule("ActParamList", ["EPSILON"]))
  .set(78, new Rule("ActParamList", ["Exp", "ActParamMore"]))
  .set(79, new Rule("ActParamMore", ["EPSILON"]))
  .set(80, new Rule("ActParamMore", ["COMMA", "ActParamList"]))
  .set(81, new Rule("RelExp", ["Exp", "OtherRelE"]))
  .set(82, new Rule("OtherRelE", ["CmpOp", "Exp"]))
  .set(83, new Rule("Exp", ["Term", "OtherTerm"]))
  .set(84, new Rule("OtherTerm", ["EPSILON"]))
  .set(85, new Rule("OtherTerm", ["AddOp", "Exp"]))
  .set(86, new Rule("Term", ["Factor", "OtherFactor"]))
  .set(87, new Rule("OtherFactor", ["EPSILON"]))
  .set(88, new Rule("OtherFactor", ["MultOp", "Term"]))
  .set(89, new Rule("Factor", ["L_PAREN", "Exp", "R_PAREN"]))
  .set(90, new Rule("Factor", ["INTC"]))
  .set(91, new Rule("Factor", ["Variable"]))
  .set(92, new Rule("Variable", ["ID", "VariMore"]))
  .set(93, new Rule("VariMore", ["EPSILON"]))
  .set(94, new Rule("VariMore", ["L_SQUARE", "Exp", "R_SQUARE"]))
  .set(95, new Rule("VariMore", ["DOT", "FieldVar"]))
  .set(96, new Rule("FieldVar", ["ID", "FieldVarMore"]))
  .set(97, new Rule("FieldVarMore", ["EPSILON"]))
  .set(98, new Rule("FieldVarMore", ["L_SQUARE", "Exp", "R_SQUARE"]))
  .set(99, new Rule("CmpOp", ["LT"]))
  .set(100, new Rule("CmpOp", ["EQ"]))
  .set(101, new Rule("AddOp", ["PLUS"]))
  .set(102, new Rule("AddOp", ["MINUS"]))
  .set(103, new Rule("MultOp", ["MULTI"]))
  .set(104, new Rule("MultOp", ["DEVIDE"]));


export type {
  Symbo,
  T_Symbo,
  N_Symbo,
} 

export {
  grammar,
}
