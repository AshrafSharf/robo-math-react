start "Assignment Or Arithmetic or Command Name "
 = (assignmentExpression/additive/call)+

assignmentExpression "Assignment"
= lhs:labelLiteral "=" rhs:callOrAdditive
{

var lhsAndRhsArguments=[];

//create a variable Expression using lhs term

lhsAndRhsArguments[0]={ name:"string",value:lhs}
lhsAndRhsArguments[1]=rhs;
return {name:"assignment",args:lhsAndRhsArguments}

}


callOrAdditive "Arithmetic Or Command Name " =
additive/call/ _ quotedstring:quotedstring { return quotedstring; }


call "Command"
 = command:(command) _ lb* { return command }


command "Command Name"
 = cmdName:stringLiteral args:Arguments+ {
     return {
       name: cmdName,
       args: args[0]
     }
   }


stringLiteral "String Literal" =
_ cmd:[A-Za-z0-9]+ _ { return cmd.join("");}

labelLiteral "String Literal" =
_ cmd:[A-Za-z0-9_]+ _ { return cmd.join("");}


expression "Expression"  =
additive/ quotedstring


Arguments "Parameters"
  = "(" _ args:ArgumentList? _ ")" {
    return args !== null ? args : [];
  }

ArgumentList "ParameterList"
  = head:expression tail:(_ "," _ expression)* {
    var result = [head];
    for (var i = 0; i < tail.length; i++) {
      result.push(tail[i][3]); // 4th element is expression
    }
    return result;
  }


powerExp "Power Expression"

= left:primary _ sign:"^" _ right:primary {return {
        name:sign,
        args:[left,right]
      } }  / primary



additive "Additive Expression"
  = left:muldiv _ sign:[+-] _ right:additive {
      return {
        name:sign,
        args:[left,right]
      }
    }
  / muldiv



muldiv "Division or Multiplication"
  = left:powerExp _ sign:[*/] _ right:muldiv {
      return {

        name: sign,
        args:[left, right]
      }
    } /powerExp



primary "Command Name or Variable or Number "
  = ( negativeOrPositive/ call/negativeOrPositiveVariable )
  / "(" _ additive:additive _ ")" { return additive; }


negativeOrPositiveVariable "negativeVariable"
=sign:_ "-" _ v:variable { return {
       name:"*",
        args:[{"name":"string","value":v.value},{name:"numeric",value:-1}]
      }} / variable



// Variables can't start with a number
variable "Variable"
 = head:[a-zA-Z_]tail:[a-zA-Z0-9_]* {

     var result = [head];
    for (var i = 0; i < tail.length; i++) {
      result.push(tail[i]);
    }


     return {
       name: "string",
       value: result.join("")
     }
   }


negativeOrPositive = _ "-" _ n:numeric { return {
        name: "numeric",
        value: n.value *-1
      }} / numeric


numeric "Numeric"
  = val:DecimalLiteral {
      return {
        name: "numeric",
        value: val
      }
    }

DecimalLiteral "Decimal Literal"
  = parts:$(DecimalIntegerLiteral "." DecimalDigits?) {
      return parseFloat(parts);
    }
  / parts:$("." DecimalDigits)     { return parseFloat(parts); }
  / parts:$(DecimalIntegerLiteral) { return parseFloat(parts); }

DecimalIntegerLiteral "Decimal"
  = "0" / NonZeroDigit DecimalDigits?

DecimalDigits
  = DecimalDigit+

DecimalDigit
  = [0-9]

NonZeroDigit
  = [1-9]

quotedstring "QuotedString"

  = '"' chars:DoubleStringCharacter* '"' {
      return { name: "quotedstring", value: chars.join("") };
    }
  / "'" chars:SingleStringCharacter* "'" {
      return { name: "quotedstring", value: chars.join("") };
    }

DoubleStringCharacter
  = "\\" char:. { return "\\" + char; }
  / !('"' / LineTerminator) SourceCharacter { return text(); }


SingleStringCharacter
  = "\\" char:. { return "\\" + char; }
  / !("'" / LineTerminator) SourceCharacter { return text(); }



LineTerminator
  = [\n\r\u2028\u2029]


SourceCharacter
  = .


value "Variable or Number or Expression"
 = variable / numeric / additive


comment
 = "//" (!lb .)*

ws
 = [ \t]

_
 = (ws / comment)*

lb
 = "\n"
