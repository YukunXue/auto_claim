import requests

# 定义 API URL
API_URL = "https://insider.side.one/airdrop/login/checkEligibility?address="

# 输入文件和输出文件
INPUT_FILE = "addresses.txt"
OUTPUT_FILE = "results.txt"

def check_eligibility(address):
    """
    检查地址是否有资格领取。
    :param address: 地址字符串
    :return: 返回 JSON 数据
    """
    try:
        response = requests.get(f"{API_URL}{address}")
        response.raise_for_status()  # 检查 HTTP 响应是否成功
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error checking address {address}: {e}")
        return None

def main():
    # 读取地址文件
    with open(INPUT_FILE, "r") as file:
        addresses = [line.strip() for line in file if line.strip()]
    
    results = []
    for address in addresses:
        print(f"Checking address: {address}")
        data = check_eligibility(address)
        if data:
            # 提取所需信息并格式化输出
            already_registered = "是" if data.get("alreadyRegistered", False) else "否"
            has_eligibility = "是" if data.get("hasEligibility", False) else "否"
            total_amount = data.get("totalAmount", 0)

            result_line = f"地址: {address} 领取资格: {has_eligibility} 是否领取: {already_registered} 数量: {total_amount}"
            results.append(result_line)
            print(result_line)
        else:
            print(f"Skipping address {address} due to an error.")

    # 将结果写入文件
    with open(OUTPUT_FILE, "w") as outfile:
        outfile.write("\n".join(results))
    print(f"Results saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
