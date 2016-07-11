module clientAdmin
{
	/**
	* Controller for the dashboard posts section
	*/
    export class PostsCtrl
    {
        public postToken: Modepress.IPost;
        public posts: Array<Modepress.IPost>;
        public showNewPostForm: boolean;
        public editMode: boolean;
        public apiURL: string;
        public scope: any;
        public successMessage: string;
        public tagString: string;
        public newCategoryMode: boolean;
        public showCategoryDelete: boolean;
        public categories: Array<Modepress.ICategory>;
        public categoryToken: Modepress.ICategory;
        public searchKeyword: string;
        public searchCategory: string;
        public sortOrder: string;
        public sortType: string;
        public showFilters: boolean;
        public showMediaBrowser: boolean;
        public defaultSlug: string;
        public targetImgReciever: string;

        private _scope: any;
        private _q: ng.IQService;
        private _ps: ModepressClientPlugin.PostService;
        private _cs: ModepressClientPlugin.CategoryService;
        private error: boolean;
        private loading: boolean;
        private errorMsg: string;
        private pager: IPagerRemote;

		// $inject annotation.
        public static $inject = ["$scope", "apiURL", "curCategories", "$q", "posts", "categories"];
        constructor(scope, apiURL: string, curCategories: Modepress.IGetCategories, $q: ng.IQService,
            ps : ModepressClientPlugin.PostService, cs : ModepressClientPlugin.CategoryService)
        {
            this.newCategoryMode = false;
            this.scope = scope;
            this.apiURL = apiURL;
            this.posts = [];
            this.successMessage = "";
            this.tagString = "";
            this.showNewPostForm = false;
            this.showCategoryDelete = false;
            this.editMode = false;
            this.showFilters = false;
            this.searchKeyword = "";
            this.searchCategory = "";
            this.sortOrder = ModepressClientPlugin.SortOrder[ModepressClientPlugin.SortOrder.desc];
            this.sortType = "created";
            this.defaultSlug = "";
            this.showMediaBrowser = false;
            this.targetImgReciever = "";
            this._scope = scope;
            this._ps = ps;
            this._cs = cs;

            this.loading = false;
            this.error = false;
            this.errorMsg = "";
            this._q = $q;
            this.pager = this.createPagerRemote();

            this.postToken = { title: "", content: "", slug: "", tags: [], categories: [], public: true, brief: "" };
            var that = this;

            // The category token
            this.categoryToken = { title: "", description: "", slug: "" };

            // Fetches the categories
            this.categories = curCategories.data;

            scope.removePost = this.removePost.bind(this);
        }

        initializeTiny()
        {
            var that = this;
            tinymce.init({
                height: 350,
                setup: function (editor)
                {
                    editor.addButton('drive', {
                        text: "",
                        image: "/media/images/image-icon.png",
                        onclick: function ()
                        {
                            that.openMediaBrowser();
                            that._scope.$apply();
                        }
                    });
                },
                content_css: '/css/mce-style.css',
                selector: "textarea", plugins: ["media", "image", "link", "code", "textcolor", "colorpicker", "table", "wordcount", "lists", "contextmenu", "charmap", "fullpage", "pagebreak", "print", "spellchecker", "fullscreen", "searchreplace"],
                toolbar1: "insertfile undo redo | styleselect | bold italic charmap | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link drive | print preview media | forecolor backcolor emoticons",
                toolbar2: "pagebreak | spellchecker searchreplace | fullpage fullscreen"
            });
        }

        /**
        * Opens the media browser
        */
        openMediaBrowser(target: string = "content")
        {
            this.showMediaBrowser = true;
            this.targetImgReciever = target;
        }

        /**
        * Closes the media browser
        */
        closeMediaBrowser()
        {
            this.showMediaBrowser = false;
        }

        /**
        * Selects a file from the media browser
        */
        selectFile(file: UsersInterface.IFileEntry)
        {
            this.showMediaBrowser = false;

            if (this.targetImgReciever == "content")
            {
                if (file.mimeType.match(/image/))
                    tinymce.editors[0].insertContent(`<img src='${file.publicURL}' />`);
                else
                    tinymce.editors[0].insertContent(`<a href href='${file.publicURL}' target='_blank'>${file.name}</a>`);
            }
            else if (this.targetImgReciever == "featured-image")
                this.postToken.featuredImage = file.publicURL;
        }

        /**
        * Makes sure the slug doesnt have any spaces
        */
        checkSlug()
        {
            if (this.postToken.slug)
                this.postToken.slug = this.postToken.slug.replace(/\s+/g, '-');
        }

        /**
        * Sets the slug to be the same as the title - except with spaces and in lower case (only if not touched first by user)
        */
        updateDefaultSlug(form)
        {
            if (!form.nSlug.$touched || !this.postToken.slug || this.postToken.slug == "")
                this.postToken.slug = this.postToken.title.split(' ').join('-').toLowerCase();
        }

        swapOrder()
        {
            this.sortOrder = (this.sortOrder == ModepressClientPlugin.SortOrder[ModepressClientPlugin.SortOrder.asc] ?
                ModepressClientPlugin.SortOrder[ModepressClientPlugin.SortOrder.desc] :
                ModepressClientPlugin.SortOrder[ModepressClientPlugin.SortOrder.asc]);

            this.pager.invalidate();
        }

        swapSortType()
        {
            this.sortType = (this.sortType == 'created' ? 'updated' : 'created');
            this.pager.invalidate();
        }

        /**
        * Sets the page into post mode
        */
        newPostMode()
        {
            this.scope.newPostForm.$setUntouched();
            this.scope.newPostForm.$setPristine();
            this.postToken = { title: "", content: "", slug: "", tags: [], categories: [], public : true };
            this.editMode = false;
            this.successMessage = "";
            tinymce.editors[0].setContent("");
            this.showNewPostForm = !this.showNewPostForm
        }

        /**
        * Sets the page into edit mode
        */
        editPostMode(post: Modepress.IPost)
        {
            this.newPostMode();
            this.editMode = true;
            this.loading = true;
            this.showNewPostForm = true;

            var that = this;
            this._ps.bySlug(post.slug, true).then(function(postToken) {
                that.postToken = postToken;
                that.loading = false;
                tinymce.editors[0].setContent(postToken.content);

            }).catch(function(err : Error) {
                that.error = true;
                that.errorMsg = err.message;
            });
        }

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
                    var searchCategory = that.searchCategory;
                    var order = that.sortOrder;
                    var sortType = that.sortType;

                    return new that._q<number>(function(resolve, reject) {
                        that._ps.all({
                            sortOrder: ModepressClientPlugin.SortOrder[order],
                            sortByUpdate: (that.sortType == 'created' ? false : true ),
                            categories: [searchCategory],
                            index: index,
                            limit: limit,
                            keyword: keyword,
                            visibility: ModepressClientPlugin.Visibility.all

                        }).then(function (token) {
                            that.posts = token.data;
                            resolve(token.count);

                        }).catch(function(err : Error) {
                            that.error = true;
                            that.errorMsg = err.message;
                            that.posts = [];
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
		* Processes the tags in a post array of keywords
		*/
        processTags()
        {
            var newTags = this.tagString.split(",");

            for (var i = 0, l = newTags.length; i < l; i++)
            {
                var newTag = newTags[i].trim();
                if (newTag != "" && this.postToken.tags.indexOf(newTag) == -1)
                    this.postToken.tags.push(newTag);
            }

            this.scope.tagForm.$setUntouched();
            this.scope.tagForm.$setPristine();

            this.tagString = "";
        }

        /**
		* Removes a tag from the post array
		*/
        removeTag(tag : string)
        {
            this.postToken.tags.splice(this.postToken.tags.indexOf(tag), 1);
        }

        /**
        * Removes a user from the database
        * @param {UsersInterface.IUserEntry} user The user to remove
        */
        removePost(post: Modepress.IPost)
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            this._ps.delete(post._id).then(function(postId) {
                that.posts.splice(that.posts.indexOf(post), 1);
                (<any>post).confirmDelete = false;

            }).catch(function(err : Error) {
                that.error = true;
                that.errorMsg = err.message;

            }).finally(function() {
                 that.loading = false;
                 (<any>post).confirmDelete = false;
            });
        }

        /**
        * Removes a category from the database by ID
        * @param {modepress.ICategory} category The category to remove
        */
        removeCategory(category: Modepress.ICategory)
        {
            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;

            this._cs.delete(category._id).then(function(){
                if (that.postToken.categories.indexOf(category.slug) != -1)
                    that.postToken.categories.splice(that.postToken.categories.indexOf(category.slug), 1);

                that.categories.splice(that.categories.indexOf(category), 1);

            }).catch(function(err: Error) {
                that.error = true;
                that.errorMsg = err.message;
            }).finally(function(){
                that.loading = false;
            })
        }

        /**
        * Creates a new user
        */
        createPost()
        {
            this.scope.newPostForm.$setSubmitted();

            if (this.scope.newPostForm.$valid == false)
                return;

            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var postToken = this.postToken;
            postToken.content = tinymce.editors[0].getContent();

            if (this.editMode)
            {
                that._ps.edit(postToken._id, postToken).then(function(token) {

                    that.successMessage = "Post updated";
                    for (var i = 0, l = that.posts.length; i < l; i++)
                        if (that.posts[i]._id == that.postToken._id) {
                            that.posts.splice(i, 1, that.postToken);
                            break;
                        }

                }).catch(function(err: Error) {
                    that.error = true;
                    that.errorMsg = err.message;
                }).finally(function(){
                    that.loading = false;
                });
            }
            else
            {
                that._ps.create(postToken).then(function (token) {
                    that.posts.push(token);
                    that.showNewPostForm = false;

                }).catch(function(err: Error) {
                    that.error = true;
                    that.errorMsg = err.message;
                }).finally(function(){
                    that.loading = false;
                });;
            }
        }

        /**
        * Creates a new category
        */
        createCategory()
        {
            this.scope.newCategoryForm.$setSubmitted();

            if (this.scope.newCategoryForm.$valid == false)
                return;

            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var categoryToken = this.categoryToken;
            that._cs.create(categoryToken).then(function (token)
            {
                that.categories.push(token);
                that.categoryToken.description = "";
                that.categoryToken.title = "";
                that.categoryToken.slug = "";
                that.scope.newCategoryForm.$setUntouched();
                that.scope.newCategoryForm.$setPristine();

            }).catch(function(err: Error) {
                that.error = true;
                that.errorMsg = err.message;
            }).finally(function() {
                that.loading = false;
            });
        }

        /**
        * Adds this category to the post's selected categories
        */
        selectCategory(category: Modepress.ICategory)
        {
            if (this.postToken.categories.indexOf(category.slug) == -1)
                this.postToken.categories.push(category.slug);
            else
                this.postToken.categories.splice(this.postToken.categories.indexOf(category.slug), 1);
        }
	}
}