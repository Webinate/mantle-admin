module clientAdmin
{
    /**
	* Sets the focus of an element when the hide and show attributes change
	*/
    export class FocusOnShow implements ng.IDirective
	{
        public link;
        public restrict: 'A';
        private _timeout: ng.ITimeoutService;

        public static $inject = [];
        constructor( timeout?: ng.ITimeoutService ) {
            this._timeout = timeout;
            this.link = this._link.bind(this);
        }

        _link(scope, elem: JQuery, attributes, ngModel)
        {
            var that = this;
            if (attributes.ngShow){
                scope.$watch(attributes.ngShow, function(newValue){
                    if(newValue){
                        that._timeout(function(){
                            elem[0].focus();
                        }, 0);
                    }
                })
            }
            if (attributes.ngHide){
                scope.$watch(attributes.ngHide, function(newValue){
                    if(!newValue){
                        that._timeout(function(){
                            elem[0].focus();
                        }, 0);
                    }
                })
            }
        }

        /**
         * Creates an intance of the directive
         */
        static factory(): ng.IDirectiveFactory
        {
            const directive = ($timeout: ng.ITimeoutService) => new FocusOnShow($timeout);
            directive.$inject = ['$timeout'];
            return directive;
        }
	}
}