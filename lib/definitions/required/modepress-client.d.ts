declare module ModepressClientPlugin {
    /**
     * Describes the visibility of the post
     */
    enum Visibility {
        /** Posts marked as public. Visible to both guest and admin users */
        public = 0,
        /** Posts marked as private. Visible to only admin users and will not show for non-admin users */
        private = 1,
        /** Visible to both guest and admin users */
        all = 2,
    }
    /**
     * Describes the order to fetch the posts
     */
    enum SortOrder {
        /** Sorts from newest to oldest */
        desc = 0,
        /** Sorts from oldest to newest */
        asc = 1,
    }
    /**
     * Describes how to filter the posts returned from a GET call.
     */
    interface IPostOptions {
        /** Sort by last updated instead of date created */
        sortByUpdate?: boolean;
        /** Filter by public, private or both */
        visibility?: Visibility;
        /** Set the number of posts returned by the call */
        limit?: number;
        /** Set the starting index for fetching posts */
        index?: number;
        /** Filter by the post author */
        author?: string;
        /** Filter by a post title or content keyword */
        keyword?: string;
        /** If true, do not fetch the post's content */
        minimal?: boolean;
        /** Specify the sort order */
        sortOrder?: SortOrder;
        /** Filter post's by the categories provided */
        categories?: string[];
        /** Filter post's by the optional tags provided */
        tags?: string[];
        /** Filter post's by the required tags provided */
        rtags?: string[];
    }
    /**
     * A service for interacting with post data and the relevant modepress endpoints
     */
    class PostService {
        private _http;
        private _url;
        private _q;
        static $inject: string[];
        constructor($http: ng.IHttpService, apiUrl: string, $q: ng.IQService);
        /**
         * Gets a post by its unique slug
         * @param {string} slug The slug of the post
         * @returns {ng.IPromise<Modepress.IPost>}
         */
        private getSingle(url);
        /**
         * Gets a post by its unique slug
         * @param {string} slug The slug of the post
         * @param {boolean} verbose [Optional] If true, returns all post data - incluing any sensitive fields - based on user privileges
         * @returns {ng.IPromise<Modepress.IPost>}
         */
        bySlug(slug: string, verbose?: boolean): ng.IPromise<Modepress.IPost>;
        /**
         * Gets a post by its id
         * @param {string} slug The slug of the post
         * @param {boolean} verbose [Optional] If true, returns all post data - incluing any sensitive fields - based on user privileges
         * @returns {ng.IPromise<Modepress.IPost>}
         */
        byId(id: string, verbose?: boolean): ng.IPromise<Modepress.IPost>;
        /**
         * Removes a post by its ID
         * @param {string} id The id of the post
         * @returns {ng.IPromise<string>}
         */
        delete(id: string): ng.IPromise<string>;
        /**
         * Edits a post by its ID
         * @param {string} id The id of the post
         * @param {Modepress.IPost} postData The post data to edit
         * @returns {ng.IPromise<string>}
         */
        edit(id: string, postData: Modepress.IPost): ng.IPromise<string>;
        /**
         * Creates a new post
         * @param {Modepress.IPost} postData The post data to create
         * @returns {ng.IPromise<Modepress.IPost>}
         */
        create(postData: Modepress.IPost): ng.IPromise<Modepress.IPost>;
        /**
         * Gets all posts that match each of the parameter conditions
         * @param {Modepress.IPostOptions} options The filter options
         */
        all(options?: IPostOptions): ng.IPromise<Modepress.IGetPosts>;
    }
}
declare module ModepressClientPlugin {
    /**
     * A service for interacting with categories
     */
    class CategoryService {
        private _http;
        private _url;
        private _q;
        static $inject: string[];
        constructor($http: ng.IHttpService, apiUrl: string, $q: ng.IQService);
        /**
         * Removes a category by its ID
         * @param {string} id The id of the category
         * @returns {ng.IPromise<string>}
         */
        delete(id: string): ng.IPromise<string>;
        /**
         * Creates a new category
         * @param {Modepress.ICategory} category The category data to create
         * @returns {ng.IPromise<Modepress.ICategory>}
         */
        create(category: Modepress.ICategory): ng.IPromise<Modepress.ICategory>;
        /**
         * Gets all categories
         * @param {number} index The start index to fetch categories from
         * @param {number} limit The number of categories to return for this call
         * @returns {Modepress.IGetCategories}
         */
        all(index?: number, limit?: number): ng.IPromise<Modepress.IGetCategories>;
    }
}
declare module ModepressClientPlugin {
    /**
     * Describes how to filter the posts returned from a GET call.
     */
    interface ICommentOptions {
        /** Sort by last updated instead of date created */
        sortByUpdate?: boolean;
        /** Filter by public, private or both */
        visibility?: Visibility;
        /** Set the number of posts returned by the call */
        limit?: number;
        /** Set the starting index for fetching posts */
        index?: number;
        /** Filter by a post title or content keyword */
        keyword?: string;
        /** Specify the sort order */
        sortOrder?: SortOrder;
        /** Filter by a given user */
        user?: string;
        /** Filter by parent comment */
        parentId?: string;
        /** If true, the comments will be returned as in an expanded JSON format. I.e. children comments are returned as child comment objects.
         * Reltaed to depth.
         */
        expanded?: boolean;
        /** Only relevant if expanded is true. Defines how deep the comment traversal must go. A value of 1 means a comment and its children are
         * returned. A value of 2, means a comment, its children, and their children are returned.
         */
        depth?: number;
    }
    /**
     * A service for interacting with comment data and the relevant modepress endpoints
     */
    class CommentService {
        private _http;
        private _url;
        private _q;
        static $inject: string[];
        constructor($http: ng.IHttpService, apiUrl: string, $q: ng.IQService);
        /**
         * Gets a comment based on the url provided
         * @param {string} slug The slug of the comment
         * @returns {ng.IPromise<Modepress.IComment>}
         */
        private getSingle(url);
        /**
         * Gets a comment by its id
         * @param {string} slug The slug of the comment
         * @returns {ng.IPromise<Modepress.IComment>}
         */
        byId(id: string): ng.IPromise<Modepress.IComment>;
        /**
         * Removes a comment by its ID
         * @param {string} user The parent user of the comment
         * @param {string} id The id of the comment
         * @returns {ng.IPromise<string>}
         */
        delete(user: string, id: string): ng.IPromise<string>;
        /**
         * Edits a comment by its ID
         * @param {string} user The parent user of the comment
         * @param {string} id The id of the comment
         * @param {Modepress.IComment} commentData The comment data to edit
         * @returns {ng.IPromise<string>}
         */
        edit(user: string, id: string, commentData: Modepress.IComment): ng.IPromise<string>;
        /**
         * Creates a new comment
         * @param {string} postId The post we are commenting on
         * @param {Modepress.IComment} commentData The comment data to create
         * @param {string} [Optional] parentId The parent comment we are commenting on
         * @returns {ng.IPromise<string>}
         */
        create(postId: string, commentData: Modepress.IComment, parentId?: string): ng.IPromise<string>;
        /**
         * Gets all comments that are children of a given parent
         * @param {string} parentId The parent comment ID
         * @param {Modepress.ICommentOptions} options The filter options
         * @returns {ng.IPromise<Modepress.IGetComments>}
         */
        allByParent(parentId: string, options?: ICommentOptions): ng.IPromise<Modepress.IGetComments>;
        /**
        * Gets all comments of a user
        * @param {string} user The username  of the user
        * @param {Modepress.ICommentOptions} options The filter options
        * @returns {ng.IPromise<Modepress.IGetComments>}
        */
        allByUser(user: string, options?: ICommentOptions): ng.IPromise<Modepress.IGetComments>;
        /**
         * Gets all comments that match each of the parameter conditions
         * @param {Modepress.ICommentOptions} options The filter options
         * @returns {ng.IPromise<Modepress.IGetComments>}
         */
        all(url?: string, options?: ICommentOptions): ng.IPromise<Modepress.IGetComments>;
    }
}
declare module ModepressClientPlugin {
    /**
     * Describes how to filter the renders returned from a GET call.
     */
    interface IRenderOptions {
        /** Set the number of renders returned by the call */
        limit?: number;
        /** Set the starting index for fetching renders */
        index?: number;
        /** Filter by a render by a keyword in its url */
        keyword?: string;
        /** If true, do not fetch the render's content */
        minimal?: boolean;
        /** Specify the sort order */
        sortOrder?: SortOrder;
    }
    /**
     * A service for interacting with page renders and the relevant modepress endpoints
     */
    class RenderService {
        private _http;
        private _url;
        private _q;
        static $inject: string[];
        constructor($http: ng.IHttpService, apiUrl: string, $q: ng.IQService);
        /**
         * Gets a render by its id
         * @param {string} id The id of the render to fetch
         * @returns {ng.IPromise<string>} Returns the preview in HTML
         */
        preview(id: string): ng.IPromise<string>;
        /**
         * Removes a render by its ID
         * @param {string} id The id of the render
         * @returns {ng.IPromise<string>} Returns the ID of the removed render
         */
        delete(id: string): ng.IPromise<string>;
        /**
         * Removes all renders
         */
        clear(): ng.IPromise<void>;
        /**
         * Gets all renders
         * @param {IRenderOptions} options
         * @returns {ng.IPromise<Modepress.IGetRenders>}
         */
        all(options: IRenderOptions): ng.IPromise<Modepress.IGetRenders>;
    }
}
declare module ModepressClientPlugin {
}
