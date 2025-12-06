/**
 * Created by Mathdisk on 3/18/14.
 * This class has nothing to do with runtime and generated JavaScript
 */

declare module robosys.lang {


    interface ArrayHelper {

        length : number;
        removeAll ():void;

        addItem  (object:any);
        removeItem  (object:any);

        contains  (object:any):Boolean;

        addAll  (object:any):void;


        addItemAt  (item:any, index:number):void

        removeItemAt  (index:number) :void

        getItemAt  (index:number):any;

        getItemIndex  (object):number;

        setItemAt  (object:any, index:number):void;
        add  (object:any):void;

        remove  (object:any) :void;

        addAt  (item:any, index:number):void

        removeAt  (index:number) :void;

        push(object:any):any;

        [index: number]: any;

        new (): ArrayHelper;

        prototype: ArrayHelper;

    }


}
    