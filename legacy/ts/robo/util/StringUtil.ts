/**
 * Created by rizwan on 4/1/14.
 */
module robo.util
{
        export class StringUtil
        {
            public static getStringFillOf(fillWith:string,upTo:number):string
            {
             var str:string = "";

             for(var i:number=0;i<upTo;i++)
             {
                 str += fillWith.charAt(i);
             }

             return str;
            }

            public static contains(source:string, val:string):boolean
            {
              var result:number = source.indexOf(val);

              if(result!=-1)
                  return  true;

              return  false;
            }

            // input.replace(/replace/g, replaceWith);
            public static replace(input:string, replace:string, replaceWith:string):string
            {
                return input.split(replace).join(replaceWith);
            }


            public static isEmpty(str:string):boolean
            {
                if (str==null)
                {
                    return true;
                }
                str = str.trim();
                return (str.length==0);
            }

        }
}
