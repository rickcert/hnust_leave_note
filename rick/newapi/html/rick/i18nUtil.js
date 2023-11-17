;
(function(i18nUtil, undefined) {
	i18nUtil.getCookie = function(c_name) {
        var c_start, c_end
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) c_end = document.cookie.length;
                return decodeURI(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    }

    /**
     * @method setCookie
     * @description 设置cookie
     * @param  {String} c_name key of cookie
     * @param  {String} value value of cookie
     * @param  {Int} durantion of cookie (minite)
     */
    i18nUtil.setCookie = function(c_name, value, expireMinutes) {
        var exdate = new Date();
        exdate.setTime(exdate.getTime() + expireMinutes * 60 * 1000);
        var paths = location.pathname.split('/');
        var ctx = paths[1];
        document.cookie = (c_name + "=" + encodeURI(value) + ((expireMinutes == null) ? "" : ";expires=" + exdate.toGMTString()) + ';path=/' + ctx + '/');
    };

    /**
     * @method i18n
     * @description i18n国际化翻译
     * @param {String} - 待翻译的内容格式为  {key}[|{defaultText},[...{params1},[...{params2}]]] || my name is {0},jack，i18nUtil.i18n('my name is {0},jack')=>my name is jack
     * @example i18nUtil.i18n('bh_aq_search|搜索,{{aaa}},{{bbb}}')
     */
    i18nUtil.i18n = function(key) {
    	if (!key) {
            return key;
        }
        var tmps = key.split('|');
        var key = tmps[0];
        if (window.i18nMap[key]) {
            return window.i18nMap[key];
        }
        if (tmps.length > 1) {
            return tmps[1];
        }
        return tmps[0];
    };

    /**
     * @method lang
     * @description 切换/获取语言
     * @param {String} [param] - 语言种类, 传参时为设置语言，可选值 zh en， 不传时则为获取当前语言
     */
    i18nUtil.lang = function(lang) {
        if (lang === undefined) {
            var curLang = i18nUtil.getCookie('EMAP_LANG');
            return curLang === '' ? 'zh' : curLang;
        }
        i18nUtil.setCookie('EMAP_LANG', lang.toLowerCase());
    };
	

})(window.i18nUtil = window.i18nUtil || {});