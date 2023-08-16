var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
const navbarBurger = $(".navbar-burger");
const faqBtns = $$(".btn-accordion");
const pasteBtn = $(".button-paste");
const urlInput = $("#url");
const alertEL = $(".message");
const alertContent = $(".message-body");
const form = document.forms.namedItem("formurl");
const downloads = $("#download");
const languageBtns = $$(".lang-item");
const loader = $(".get-loader");
const closeStickyBtn = $("#sticky-close");
const adBoxs = $$(".ad-box");

function isIOS() {
    return (["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod", ].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document));
}

function isAndroid() {
    var useragent = navigator.userAgent.toLowerCase();
    return useragent.indexOf("android") > -1;
}
const app = {
    config: JSON.parse(localStorage.getItem(STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    },
    handleEvents: function() {
        const _this = this;
        adBoxs.forEach(function(adBox) {
            const observer = new MutationObserver(function(mutations, observer) {
                if (adBox) {
                    adBox.style.minHeight = "";
                }
            });
            observer.observe(adBox, {
                attributes: true,
                attributeFilter: ["style"],
            });
        });
        form && form.addEventListener("submit", function(ev) {
            gtag("event", "click_get_video", {
                value_input: urlInput.value,
            });
            if (_this.validator()) {
                loader.classList.add("is-active");
                var oData = new FormData(form);
                var oReq = new XMLHttpRequest();
                oReq.open("POST", "abc2.php", true);
                oReq.onload = function(oEvent) {
                    if (oReq.status == 200) {
                        _this.insertAndExecute("js-result", "<scri" +
                            "pt type='text/javascript'>" +
                            oReq.response +
                            "</scr" +
                            "ipt>");
                    } else {
                        _this.showAlert("Error " + oReq.status + " something went wrong.", "error_status" + oReq.status, urlInput.value);
                    }
                };
                oReq.send(oData);
            }
            ev.preventDefault();
        }, false);
        languageBtns.forEach(function(langBtn) {
            langBtn.onclick = function(e) {
                _this.setConfig("hl", this.dataset.hl);
            };
        });
        navbarBurger.onclick = function(e) {
            navbarBurger.classList.toggle("is-active");
            $("#snaptik-menu").classList.toggle("is-active");
        };
        faqBtns.forEach((faq) => {
            faq.addEventListener("click", () => {
                var accContent = faq.nextElementSibling;
                if (faq.classList.contains("active")) {
                    faq.classList.remove("active");
                    accContent.style.maxHeight = null;
                } else {
                    var accsIsOpen = $$(".btn-accordion.active");
                    accsIsOpen.forEach((accIsOpen) => {
                        accIsOpen.classList.remove("active");
                        accIsOpen.nextElementSibling.style.maxHeight = null;
                    });
                    faq.classList.add("active");
                    accContent.style.maxHeight = accContent.scrollHeight + "px";
                }
            });
        });
        pasteBtn && pasteBtn.addEventListener("click", () => {
            if (pasteBtn.classList.contains("btn-clear")) {
                urlInput.value = "";
                if (navigator.clipboard) {
                    pasteBtn.classList.remove("btn-clear");
                    $(".button-paste span").innerText = jsLang.paste;
                }
            } else {
                if (navigator.clipboard) {
                    navigator.clipboard.readText().then(function(e) {
                        if (e != "") {
                            urlInput.value = e;
                            _this.showBtnClear();
                        } else {
                            _this.showAlert(jsLang.linkEmpty, "input_empty");
                        }
                    });
                }
            }
        });
        if (!navigator.clipboard) {
            pasteBtn.remove();
        }
        urlInput && urlInput.addEventListener("keyup", function(e) {
            if (urlInput.value.length > 0) {
                _this.showBtnClear();
            }
            _this.hideAlert;
        });
        if (isAndroid()) {
            $(".button-install").style.display = "flex";
        }
        if (downloads) {
            downloads.onclick = function(e) {
                const downloadBtn = e.target.closest(".download-file");
                if (downloadBtn) {
                    if (downloadBtn.dataset.ad === "true") {
                        var vignetteAds = document.querySelectorAll('ins[data-vignette-loaded="true"]');
                        if (vignetteAds.length === 0) {
                            if (isIOS()) {
                                e.preventDefault();
                            }
                            e.stopPropagation();
                            _this.openAdsModal();
                            if (isIOS()) {
                                setTimeout(function() {
                                    if (downloadBtn.getAttribute("href") != null) {
                                        window.location.href = downloadBtn.getAttribute("href");
                                    } else {
                                        sendEvent("Error_Download_vignetteAds");
                                    }
                                }, 1000);
                            }
                        }
                    }
                    if (downloadBtn.dataset.event) {
                        gtag("event", "click_download_file", {
                            server_name: downloadBtn.dataset.event,
                        });
                    }
                }
                const renderBtn = e.target.closest(".btn-render");
                if (renderBtn) {
                    startRender(renderBtn.dataset.token);
                }
            };
        }
        closeStickyBtn.onclick = function() {
            $("#ad-sticky").remove();
        };
    },
    validator: function() {
        const link = urlInput.value;
        const regexLink = /https?:\/\/(?:[-\w]+\.)?[-\w]+(?:\.\w+)+\/?.*/;
        const regexLinkTiktok = /(https?:\/\/)(?:www\.)?(?:tiktok\.com|(?:[a-z]{2,3}\.)?douyin\.com|(?:[a-z]{1,3}\.)?xzcs3zlph\.com|(?:[a-z]{1,3}\.)?tiktok\.com)\/[^ ]*/;
        const isLink = link.match(regexLink);
        if (link === "") {
            this.showAlert(jsLang.linkEmpty, "link_empty");
            return false;
        }
        if (!isLink) {
            this.showAlert(jsLang.notUrl, "error_url", urlInput.value);
            return false;
        }
        if (this.showPartnerLink(link)) {
            return false;
        }
        return true;
    },
    showPartnerLink: function(link) {
        if (link.indexOf("instagram.com/") !== -1) {
            this.showAlert(decodeURIComponent(jsLang.partnerIg), "input_url_instagram", urlInput.value);
            return true;
        }
        if (link.indexOf("facebook.com/") !== -1 || link.indexOf("fb.com/") !== -1) {
            this.showAlert(decodeURIComponent(jsLang.partnerFb), "input_url_facebook", urlInput.value);
            return true;
        }
        return false;
    },
    openAdsModal: function() {
        $("#modal-vignette").classList.add("is-active");
        $(".modal-content").innerHTML = `<div class="snapcdn-ad"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2496545456108734" data-ad-slot="5058619510" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`;
        (adsbygoogle = window.adsbygoogle || []).push({});
        setTimeout(lookForChange, 500);
    },
    hideAlert: function() {
        alertEL.classList.remove("show");
        alertContent.innerHTML = "";
    },
    showAlert: function(msg, eventName = null, valueInput = null) {
        loader.classList.remove("is-active");
        alertEL.classList.add("show");
        alertContent.innerHTML = msg;
        setTimeout(function() {
            alertEL.classList.remove("show");
            alertContent.innerHTML = "";
        }, 3000);
        if (eventName) {
            gtag("event", "get_video_failure", {
                error_code: eventName,
                value_input: valueInput,
            });
        }
    },
    showBtnClear: function() {
        pasteBtn.classList.add("btn-clear");
        $(".button-paste span").innerText = jsLang.clear;
    },
    insertAndExecute: function(id, text) {
        domelement = document.getElementById(id);
        domelement.innerHTML = text;
        var scripts = [];
        ret = domelement.childNodes;
        for (var i = 0; ret[i]; i++) {
            if (scripts && this.nodeName(ret[i], "script") && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript")) {
                scripts.push(ret[i].parentNode ? ret[i].parentNode.removeChild(ret[i]) : ret[i]);
            }
        }
        for (script in scripts) {
            this.evalScript(scripts[script]);
        }
    },
    nodeName: function(el, name) {
        return el.nodeName && el.nodeName.toUpperCase() === name.toUpperCase();
    },
    evalScript: function(el) {
        data = el.text || el.textContent || el.innerHTML || "";
        var head = document.getElementsByTagName("head")[0] || document.documentElement,
            script = document.createElement("script");
        script.type = "text/javascript";
        script.appendChild(document.createTextNode(data));
        head.insertBefore(script, head.firstChild);
        head.removeChild(script);
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    },
    start: function() {
        this.handleEvents();
    },
};
app.start();
document.addEventListener("DOMContentLoaded", () => {
    function closeModal($el) {
        $el.classList.remove("is-active");
    }

    function closeAllModals() {
        (document.querySelectorAll(".modal") || []).forEach(($modal) => {
            closeModal($modal);
        });
    }
    (document.querySelectorAll(".modal-background, .modal-close") || []).forEach(($close) => {
        const $target = $close.closest(".modal");
        $close.addEventListener("click", () => {
            closeModal($target);
        });
    });
    document.addEventListener("keydown", (event) => {
        const e = event || window.event;
        if (e.keyCode === 27) {
            closeAllModals();
        }
    });
});