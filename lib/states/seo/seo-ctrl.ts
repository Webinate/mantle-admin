module clientAdmin
{
	/**
	* Controller for the dashboard users section
	*/
    export class SEOCtrl
	{
        protected cacheURL: string;
        protected showRenders: boolean;
        protected renders: Array<Modepress.IRender>;

        private _q: ng.IQService;
        private error: boolean;
        private loading: boolean;
        private errorMsg: string;
        private pager: IPagerRemote;
        private searchTerm: string;
        private _rs: ModepressClientPlugin.RenderService;

		// $inject annotation.
        public static $inject = ["$scope", "cacheURL", "$q", "renders"];
        constructor(scope: any, cacheURL: string, $q : ng.IQService, renders : ModepressClientPlugin.RenderService)
        {
            this.showRenders = true;
            this.cacheURL = cacheURL;
            this.renders = [];

            this._q = $q;
            this.loading = false;
            this.error = false;
            this.errorMsg = "";
            this.searchTerm = "";
            this._rs = renders;
            this.pager = this.createPagerRemote();
        }

        /**
         * Fetches the users from the database
         * @returns {IPagerRemote}
         */
        createPagerRemote(): IPagerRemote
        {
            var that = this;
            var remote: IPagerRemote = {
                update: function(index?: number, limit? : number)
                {
                    that.error = false;
                    that.errorMsg = "";
                    that.loading = true;

                    return new that._q<number>(function(resolve, reject)
                    {
                        that._rs.all({
                            index: index,
                            limit: limit,
                            keyword: that.searchTerm
                        }).then(function (token) {
                            that.renders = token.data;
                            resolve(token.count);

                        }).catch( function(err : Error ) {
                            that.error = true;
                            that.errorMsg = err.message;
                            that.renders = [];
                            resolve(1);

                        }).finally(function(){
                            that.loading = false;
                        })
                    });
                }
            };

            return remote;
        }

        /**
        * Clears all render items
        */
        clearRenders()
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            that._rs.clear().then(function(){
                that.renders = [];

            }).catch( function(err : Error ) {
                that.error = true;
                that.errorMsg = err.message;

            }).finally(function(){
                that.loading = false;
            });
        }

        /**
        * Removes a render from the database
        */
        removeRender(render: Modepress.IRender)
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            that._rs.delete(render._id).then(function (token)
            {
                that.renders.splice(that.renders.indexOf(render), 1);

            }).catch( function(err : Error ) {
                that.error = true;
                that.errorMsg = err.message;

            }).finally(function(){
                that.loading = false;
                (<any>render).confirmDelete = false;
            });
        }
	}
}