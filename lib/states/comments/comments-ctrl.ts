module clientAdmin
{
    export interface CustomComment extends Modepress.IComment {
        $editing?: boolean;
        $content? : string;
    };

	/**
	* Controller for the dashboard comments section
	*/
    export class CommentsCtrl
    {
        public comments: Array<Modepress.IComment>;
        public scope: any;
        public searchKeyword: string;
        public sortOrder: string;
        public sortType: string;
        public showFilters: boolean;

        private _q: ng.IQService;
        private _ps: ModepressClientPlugin.PostService;
        private _cs: ModepressClientPlugin.CommentService;

        private error: boolean;
        private loading: boolean;
        private errorMsg: string;
        private pager: IPagerRemote;

		// $inject annotation.
        public static $inject = ["$scope", "$q", "posts", "comments"];
        constructor(scope, $q: ng.IQService, ps : ModepressClientPlugin.PostService, cs : ModepressClientPlugin.CommentService)
        {
            this.scope = scope;
            this.comments = [];
            this.showFilters = false;
            this.searchKeyword = "";
            this.sortOrder = ModepressClientPlugin.SortOrder[ModepressClientPlugin.SortOrder.desc];
            this.sortType = "created";
            this._ps = ps;
            this._cs = cs;
            this.loading = false;
            this.error = false;
            this.errorMsg = "";
            this._q = $q;
            this.pager = this.createPagerRemote();
            scope.removeComment = this.removeComment.bind(this);
        }

        swapOrder()
        {
            this.sortOrder = (this.sortOrder == "asc" ? "desc" : "asc" );
            this.pager.invalidate();
        }

        swapSortType()
        {
            this.sortType = (this.sortType == 'created' ? 'updated' : 'created');
            this.pager.invalidate();
        }

        /**
         * Given comment goes into an edit mode
         * @param {CustomComment} comment The comment to edit
         * @param {number} index The index of the comment
         */
        edit(comment: CustomComment, index: number ) {
            jQuery(`.edit-box-${index}`).focus();
            comment.$content = comment.content;
            comment.$editing = true
        }

        /**
         * Creates a pager remote control
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
                    var keyword = that.searchKeyword;
                    var order = that.sortOrder;
                    var sortType = that.sortType;

                    return new that._q<number>(function(resolve, reject) {
                        that._cs.all({
                            sortOrder: ( order == "asc" ? ModepressClientPlugin.SortOrder.asc : ModepressClientPlugin.SortOrder.desc ),
                            sortByUpdate: (that.sortType == 'created' ? false : true ),
                            index: index,
                            limit: limit,
                            keyword: keyword,
                            visibility: ModepressClientPlugin.Visibility.all

                        }).then(function (token) {
                            that.comments = token.data;
                            resolve(token.count);

                        }).catch(function(err : Error) {
                            that.error = true;
                            that.errorMsg = err.message;
                            that.comments = [];
                            resolve(1);

                        }).finally(function() {
                            that.loading = false;
                        });
                    });
                }
            }

            return remote;
        }

        /**
         * Edits a comment on the fly
         * @param {Modepress.IComment} comment The comment we are editing
         * @param {Modepress.IComment} editBody The comment variables we are updating
         */
        quickEdit( comment : CustomComment, editBody : CustomComment ) {
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var that = this;

            this._cs.edit(comment._id, editBody).then(function (token) {
                for ( var i in editBody )
                    if ( comment.hasOwnProperty(i) )
                        comment[i] = editBody[i];

                comment.$editing = false;

            }).catch(function(err : Error) {
                that.error = true;
                that.errorMsg = err.message;

            }).finally(function() {
                that.loading = false;
            });
        }

        /**
        * Removes a comment from the database
        * @param {Modepress.IComment} comment The comment to remove
        */
        removeComment(comment: CustomComment)
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            this._cs.delete(comment._id).then(function(commentId) {
                that.comments.splice(that.comments.indexOf(comment), 1);
                (<any>comment).confirmDelete = false;

            }).catch(function(err : Error) {
                that.error = true;
                that.errorMsg = err.message;

            }).finally(function() {
                 that.loading = false;
                 (<any>comment).confirmDelete = false;
            });
        }
	}
}