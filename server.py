import http.server
import urllib.parse
import os
import datetime
import PIL
import json
import pyautogui

current_directory = os.path.dirname(os.path.realpath(__file__))

# 获取今天的日期
today_date = datetime.datetime.today().strftime('%Y-%m-%d')

# 检查是否存在今天的文件夹
folder_path = today_date  # 替换为您的目录路径
if not os.path.exists(folder_path):
    # 如果不存在，新建文件夹
    os.makedirs(folder_path)
    print(f'创建了新文件夹: {folder_path}')
else:
    # 如果存在，无需做任何操作
    print(f'文件夹 {folder_path} 已存在')

# 将文件夹路径保存到变量
folder_variable = folder_path + "/"
print(f'文件夹路径保存到变量: {folder_variable}')


class ImageAndTextHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/AutoPenetrationTesting/ClickData':

            # 获取请求的数据长度
            content_length = int(self.headers['Content-Length'])
            # 读取请求的数据
            post_data = self.rfile.read(content_length).decode('utf-8')

            if post_data and post_data != {}:
                postjson = json.loads(post_data)
                text = postjson.get('text')
                xpath = postjson.get('xpath')
                if text and text is not None:
                    # 截取整个屏幕
                    print(post_data)

                    # 获取鼠标位置
                    x, y = pyautogui.position()

                    # 截取全屏
                    screenshot = pyautogui.screenshot()

                    # 设置分辨率

                    # 在鼠标位置绘制标记
                    draw = PIL.ImageDraw.Draw(screenshot)
                    draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill="red", outline="red")

                    # 保存截图
                    # 保存截图
                    s_ = text[0:10] + " - " + datetime.datetime.now().strftime('%Y-%m-%d %H-%M-%S.%f')[:-4]
                    screenshot.save(folder_variable + s_ + ".jpg", format="JPEG",
                                    quality=60)  # 调整 quality 以确保图片不超过 500kb
                    post_url = postjson.get('url')
                    if not os.path.exists(folder_variable + 'PCaptureData.txt'):
                        with open(folder_variable + 'PCaptureData.txt', 'w', encoding="utf-8") as file:
                            file.close()
                            with open(folder_variable + 'PCaptureData.txt', 'a+', encoding="utf-8") as file:
                                file.write(s_ + " - " + post_url + " - " + xpath + "\n")
                    else:
                        with open(folder_variable + 'PCaptureData.txt', 'a+', encoding="utf-8") as file:
                            file.write(s_ + " - " + post_url + " - " + xpath + "\n")


        else:
            self.send_response(404)

    def do_OPTIONS(self):
        # 处理预检请求
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST")
        self.end_headers()


if __name__ == '__main__':
    server_address = ('', 8091)
    httpd = http.server.HTTPServer(server_address, ImageAndTextHandler)
    httpd.serve_forever()
