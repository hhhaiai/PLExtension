function showNotification(title, message, onClickCallback) {
	if (!title) {
		title = chrome.i18n.getMessage("app_name")
	}
	chrome.notifications.create({
		type: 'basic',
		title: title,
		message: message,
		iconUrl: 'icons/logo32.png'
	}, function () { });

	if (onClickCallback) {
		chrome.notifications.onClicked.addListener(onClickCallback);
	}
}
// 安装时的初始化
let browser_Open_with
chrome.runtime.onInstalled.addListener(function (details) {
	if (details.reason === "install") {
		try {
			if (window.navigator.userAgent.indexOf('Firefox') > -1) {
				chrome.storage.local.set({ 'browser_Open_with': 1 }, function () {
					chrome.tabs.create({
						'url': ('popup.html')
					});
					console.log(chrome.i18n.getMessage("Installing_initialization"));
				});
			} else {
				chrome.storage.local.set({ 'browser_Open_with': 3 }, function () {
					chrome.action.setPopup({
						popup: "popup.html"
					});
					console.log(chrome.i18n.getMessage("Installing_initialization"));
				});
			}
		} catch (error) {
			chrome.storage.local.set({ 'browser_Open_with': 1 }, function () {
				chrome.tabs.create({
					'url': ('popup.html')
				});
				console.log(chrome.i18n.getMessage("Installing_initialization"));
			});
		}
		chrome.storage.local.set({ "GlobalUpload": "GlobalUpload_Default" }) //全局上传
		chrome.storage.local.set({ "Right_click_menu_upload": "on" }) //右键上传
		chrome.storage.local.set({ "AutoInsert": "AutoInsert_on" }) //自动插入

		chrome.storage.local.set({ "edit_uploadArea_width": 32 }) //宽度
		chrome.storage.local.set({ "edit_uploadArea_height": 30 }) //高度
		chrome.storage.local.set({ "edit_uploadArea_Location": 34 }) //位置
		chrome.storage.local.set({ "edit_uploadArea_opacity": 0.3 }) //透明度
		chrome.storage.local.set({ "edit_uploadArea_auto_close_time": 2 }) //关闭时间
		chrome.storage.local.set({ "edit_uploadArea_Left_or_Right": "Right" })

		chrome.contextMenus.create({
			title: chrome.i18n.getMessage("Right_click_menu_upload_prompt"),
			contexts: ["image"],
			id: "upload_imagea"
		})

		chrome.storage.local.get(["browser_Open_with"], function (result) {
			browser_Open_with = result.browser_Open_with
			showNotification(null, chrome.i18n.getMessage("Installing_initialization_completed"), function () {
				chrome.tabs.create({
					'url': ('options.html')
				});
			})
		});


	}
});

const getSave = [
	"options_exe",
	"options_proxy_server_state",
	"options_proxy_server",
	"options_host",
	"options_token",
	"options_uid",
	"options_source",
	"options_imgur_post_mode",
	"options_source_select",
	"options_expiration_select", //删除时间
	"options_album_id", //相册
	"options_nsfw_select",//是否健康
	"options_permission_select",//是否公开
	//自定义请求
	"options_apihost",
	"options_parameter",
	"options_Headers",
	"options_Body",
	"options_return_success",
	"open_json_button",
]

chrome.storage.local.get(["Right_click_menu_upload"], function (result) {
	if (result.Right_click_menu_upload == "on") {
		chrome.contextMenus.create({
			title: chrome.i18n.getMessage("Right_click_menu_upload_prompt"),
			contexts: ["image"],
			id: "upload_imagea"
		}, function () {
			if (chrome.runtime.lastError) {
				console.log("Menu item created successfully.");
			} else {
				return;
			}
		});
	}
})



chrome.contextMenus.onClicked.addListener(function (info) {
	if (info.menuItemId === "upload_imagea") {
		const imgUrl = info.srcUrl;
		Fetch_Upload(imgUrl, null, "Rightupload")
	}

});

function Fetch_Upload(imgUrl, data, MethodName, callback) {
	if (Simulated_upload == true) {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			let currentTabId
			try {
				currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { Demonstration_middleware: "Right_click_100" }, function (response) {
					if (chrome.runtime.lastError) {
						//发送失败
						return;
					}
				});
			} catch (error) {
			}
		});
		return;
	}
	if (typeof callback !== 'function') {
		callback = function () { };
	}
	chrome.storage.local.get(getSave, function (result) {
		let options_exe = result.options_exe
		let options_proxy_server_state = result.options_proxy_server_state
		let options_proxy_server = result.options_proxy_server
		let options_host = result.options_host
		let options_token = result.options_token
		let options_uid = result.options_uid
		let options_source = result.options_source
		let options_source_select = result.options_source_select
		let options_expiration_select = result.options_expiration_select || "NODEL"
		let options_album_id = result.options_album_id
		let options_nsfw_select = result.options_nsfw_select || 0
		let options_permission_select = result.options_permission_select || 0
		//自定义请求
		let options_apihost = result.options_apihost
		let options_parameter = result.options_parameter
		let options_Headers = result.options_Headers
		let options_Body = result.options_Body
		let options_return_success = result.options_return_success
		// var open_json_button = result.open_json_button

		let d = new Date();
		const getFullYear = d.getFullYear()
		const getMonth = d.getMonth() + 1
		const getDate = d.getDate()
		const getHours = d.getHours()
		const getMinutes = d.getMinutes()
		const getSeconds = d.getSeconds()
		const getStamp = d.getTime()
		if (!options_Headers) {
			options_Headers = {}
		} else {
			try {
				options_Headers = JSON.parse(options_Headers);
			} catch (error) {
				showNotification(null, chrome.i18n.getMessage("Headers_error"), function () {
					chrome.tabs.create({
						'url': ('options.html')
					});
				})
				console.error(chrome.i18n.getMessage("Headers_error"))
				return;
			}
		}
		if (!options_Body) {
			options_Body = {}
		} else {
			try {
				options_Body = JSON.parse(options_Body);
			} catch (error) {
				showNotification(null, chrome.i18n.getMessage("Body_error"), function () {
					chrome.tabs.create({
						'url': ('options.html')
					});
				})
				console.error(chrome.i18n.getMessage("Body_error"))
				return;
			}
		}

		// 判断跨域开关
		if (options_proxy_server_state == 0) {
			options_proxy_server = ""
		}
		if (!options_proxy_server) {
			options_proxy_server = ""
		}
		async function Img_Request_Success(blob) {
			showNotification(null, chrome.i18n.getMessage("Upload_prompt1"))
			let UrlImgNema = options_exe + '_' + MethodName + '_' + d.getTime() + '.png'
			const file = new File([blob], UrlImgNema, { type: 'image/png' });//将获取到的图片数据(blob)导入到file中
			const formData = new FormData();
			// 自定义上传属性
			let optionsUrl
			let optionHeaders

			/**
			 * 上传到图床
			 */
			switch (options_exe) {
				case 'Lsky':
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/v1/upload";
					optionHeaders = { "Authorization": options_token };
					formData.append('file', file);
					if (options_source_select) {
						formData.append("strategy_id", options_source_select);
					}
					if (options_album_id) {
						formData.append("album_id", options_album_id);
					}
					formData.append("permission", options_permission_select);
					break;
				case 'EasyImages':
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/index.php";
					formData.append('image', file);
					formData.append('token', options_token);
					break;
				case 'ImgURL':
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/v2/upload";
					formData.append('uid', options_uid);
					formData.append('token', options_token);
					formData.append('file', file);
					break;
				case 'SM_MS':
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/v2/upload";
					optionHeaders = { "Authorization": options_token };
					formData.append('smfile', file);
					break;
				case 'Chevereto':
					let Temporary_URL = ""
					if (options_expiration_select != "NODEL") {
						Temporary_URL += "&expiration=" + options_expiration_select
					}
					if (options_album_id) {
						Temporary_URL += "&album_id=" + options_album_id
					}
					if (options_nsfw_select) {
						Temporary_URL += "&nsfw=" + options_nsfw_select
					}
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/1/upload/?key=" + options_token;
					optionHeaders = { "Authorization": options_token };
					formData.append('source', file);
					break;
				case 'Hellohao':
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/uploadbytoken/";
					formData.append('file', file);
					formData.append('token', options_token);
					formData.append('source', options_source);
					break;
				case 'Imgur':
					optionsUrl = options_proxy_server + "https://" + options_host + "/3/upload";
					optionHeaders = { "Authorization": 'Client-ID ' + options_token };
					formData.append("image", file);
					break;
				case 'UserDiy':
					optionsUrl = options_proxy_server + options_apihost;
					formData.append(options_parameter, file);
					optionHeaders = options_Headers;
					for (let key in options_Body) {
						formData.append(key, options_Body[key]);
					}
					break;
				case 'Telegra_ph':
					optionsUrl = options_proxy_server + "https://" + options_host + "/upload";
					optionHeaders = { "Accept": "application/json" };
					formData.append("file", file);
					break;
				case 'imgdd':
					optionsUrl = options_proxy_server + "https://" + options_host + "/api/v1/upload";
					optionHeaders = { "Accept": "application/json", "User-Agent": "PLExtension" };
					formData.append("image", file);
					break;
			}
			fetch(optionsUrl, {
				method: 'POST',
				body: formData,
				headers: optionHeaders
			})
				.then(response => response.json())
				.then(res => {
					console.log(res);
					let imageUrl
					switch (options_exe) {
						case 'Lsky':
							imageUrl = res.data.links.url
							break;
						case 'EasyImages':
							imageUrl = res.url
							break;
						case 'ImgURL':
							imageUrl = res.data.url
							break;
						case 'SM_MS':
							if (res.code == "image_repeated") {
								imageUrl = res.images
							} else {
								imageUrl = res.data.url
							}
							break;
						case 'Chevereto':
							imageUrl = res.image.url
							break;
						case 'Hellohao':
							imageUrl = res.data.url
							break;
						case 'Imgur':
							imageUrl = res.data.link
							break;
						case 'UserDiy':
							const options_return_success_value = res;
							options_return_success.split('.').forEach(function (prop) {
								if (options_return_success_value) {
									options_return_success_value = options_return_success_value[prop];
								}
							});
							imageUrl = options_return_success_value
							break;
						case 'Telegra_ph':
							if (res.error) {
								showNotification(null, res.error)
								return;
							}
							imageUrl = `https://telegra.ph/` + res[0].src
							break;
						case 'imgdd':
							imageUrl = res.url
							break;
					}
					chrome.storage.local.get('UploadLog', function (result) {
						let UploadLog = result.UploadLog || [];
						if (!Array.isArray(UploadLog)) {
							UploadLog = [];
						}
						function generateRandomKey() {
							return new Promise(resolve => {
								const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
								let key = '';
								for (let i = 0; i < 6; i++) {
									key += characters.charAt(Math.floor(Math.random() * characters.length));
								}
								// 确保不会重复
								while (UploadLog.some(log => log.id === key)) {
									key = '';
									for (let i = 0; i < 6; i++) {
										key += characters.charAt(Math.floor(Math.random() * characters.length));
									}
								}
								resolve(key);
							});
						}
						generateRandomKey().then(key => {
							const UploadLogData = {
								key: key,
								url: imageUrl,
								uploadExe: options_exe + "-" + MethodName,
								upload_domain_name: options_host,
								original_file_name: UrlImgNema,
								file_size: file.size,
								img_file_size: chrome.i18n.getMessage("img_file_size"),
								uploadTime: getFullYear + "年" + getMonth + "月" + getDate + "日" + getHours + "时" + getMinutes + "分" + getSeconds + "秒"
							}
							if (typeof UploadLog !== 'object') {
								UploadLog = JSON.parse(UploadLog);
							}
							UploadLog.push(UploadLogData);
							chrome.storage.local.set({ 'UploadLog': UploadLog }, function () {
								showNotification(null, chrome.i18n.getMessage("Upload_prompt2"))
							})
							callback(res, null);
							chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
								let currentTabId
								try {
									currentTabId = tabs[0].id;
									chrome.tabs.sendMessage(currentTabId, { AutoInsert_message: imageUrl }, function (response) {
										if (chrome.runtime.lastError) {
											//发送失败
											return;
										}
									});
								} catch (error) {
								}
							});
						});
					});
				})
				.catch(error => {
					console.error(error);
					callback(null, new Error(chrome.i18n.getMessage("Upload_prompt3")));
					showNotification(null, chrome.i18n.getMessage("Upload_prompt4") + error.toString())
				});
		}

		/**
		 * 在线图片请求
		 */
		if (MethodName == "GlobalUpload") {
			Img_Request_Success(data)
			return;
		}
		if (options_exe == "Tencent_COS") {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				let currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { Tencent_COS_contextMenus: imgUrl })
			});
			return;
		}
		if (options_exe == "Aliyun_OSS") {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				let currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { Aliyun_OSS_contextMenus: imgUrl })
			});
			return;
		}
		if (options_exe == "AWS_S3") {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				let currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { AWS_S3_contextMenus: imgUrl })
			});
			return;
		}
		if (options_exe == "GitHubUP") {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				let currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { GitHubUP_contextMenus: { url: imgUrl, Metho: MethodName }, })
			});
			return;
		}
		fetch(options_proxy_server + imgUrl)
			.then(res => res.blob())
			.then(blob => {
				Img_Request_Success(blob)
			})
			.catch(error => {
				console.log(chrome.i18n.getMessage("Upload_prompt5"))
				fetch("https://cors-anywhere.pnglog.com/" + imgUrl)
					.then(res => res.blob())
					.then(blob => {
						Img_Request_Success(blob)
					})
					.catch(error => {
						console.log(chrome.i18n.getMessage("Upload_prompt6"))
						console.log(error)
						return;
					})
			})

	})


}

/**	
 * request返回信息
 * sender发送信息页面以及它的详细信息
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	//大喇叭
	if (request.Loudspeaker) {
		showNotification(null, request.Loudspeaker)
	}
	//拖拽上传
	// Circle_dragUpload
	if (request.Drag_Upload) {
		const imgUrl = request.Drag_Upload;
		Fetch_Upload(imgUrl, null, "Drag_Upload")
	}
	//全局上传
	if (request.GlobalUpload) {
		let base64String = request.GlobalUpload
		function processBase64String(index) {
			if (index < base64String.length) {
				let binaryData = atob(base64String[index]);
				let array = new Uint8Array(binaryData.length);
				for (let i = 0; i < binaryData.length; i++) {
					array[i] = binaryData.charCodeAt(i);
				}
				let blob = new Blob([array], { type: 'image/jpeg' });
				Fetch_Upload(null, blob, "GlobalUpload", () => {
					setTimeout(function () {
						processBase64String(index + 1);
					}, 150);
				})

			}
		}
		processBase64String(0)
	}
	//自动插入，中间件转发
	if (request.Middleware_AutoInsert_message) {
		let AutoInsert_message_content = request.Middleware_AutoInsert_message
		//向当前选项卡发送消息
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			let currentTabId
			try {
				currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { AutoInsert_message: AutoInsert_message_content }, function (response) {
					if (chrome.runtime.lastError) {
						//发送失败
						return;
					}
				});
			} catch (error) {
				return "未找到插入组件"
			}

		});
	}
	//演示动画中间转发
	if (request.Demonstration_middleware) {

		/**
		 * 粘贴演示完成
		 */
		if (request.Demonstration_middleware == "Paste_Upload_100") {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				let currentTabId
				try {
					currentTabId = tabs[0].id;
				} catch (error) {
				}
				//拖拽开启
				chrome.tabs.sendMessage(currentTabId, { Demonstration_middleware: "Drag_upload_0" }, function (response) {
					if (chrome.runtime.lastError) {
						//发送失败
						return;
					}
				});
			});
		}
		/**	
		 * 拖拽演示完成
		 */
		if (request.Demonstration_middleware == "Drag_upload_100") {
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				let currentTabId
				try {
					currentTabId = tabs[0].id;
				} catch (error) {
				}
				//右键开启
				chrome.tabs.sendMessage(currentTabId, { Demonstration_middleware: "Right_click_0" }, function (response) {
					if (chrome.runtime.lastError) {
						//发送失败
						return;
					}
				});
			});
		}
		/**右键上传开始 */
		if (request.Demonstration_middleware == "Right_click_1") {
			Simulated_upload = true
		}
		/**表演结束 */
		if (request.Demonstration_middleware == "demonstrate_end") {
			Simulated_upload = false
		}

		// 关闭演示
		if (request.Demonstration_middleware == "closeIntro") {
			Simulated_upload = false
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				let currentTabId
				try {
					currentTabId = tabs[0].id;
				} catch (error) {
				}
				// 告诉content_scripts.js关闭演示
				chrome.tabs.sendMessage(currentTabId, { Demonstration_middleware: "closeIntro" }, function (response) {
					if (chrome.runtime.lastError) {
						//发送失败
						return;
					}
				});
			});
		}
	}
	//演示模式
	if (request.Functional_Demonstration) {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			let currentTabId
			try {
				currentTabId = tabs[0].id;
				chrome.tabs.sendMessage(currentTabId, { Paste_Upload_Start: "粘贴上传开始" }, function (response) {
					if (chrome.runtime.lastError) {
						//发送失败
						return;
					}
				});
			} catch (error) {
			}
		});
	}
});
let Simulated_upload = false//模拟上传

chrome.action.onClicked.addListener(function (tab) {
	chrome.storage.local.get(["browser_Open_with"], function (result) {
		browser_Open_with = result.browser_Open_with
		if (browser_Open_with == 1) {
			// 在标签页打开
			chrome.tabs.create({
				'url': ('popup.html')
			});
		}
		if (browser_Open_with == 2) {
			// 在新窗口打开
			chrome.windows.create({
				type: "popup",
				url: "popup.html",
				width: 1024,
				height: 730
			});
		}
		if (browser_Open_with === 3) {
			// 在内置页打开
			chrome.action.setPopup({
				popup: "popup.html"
			});
		}
	});

});


