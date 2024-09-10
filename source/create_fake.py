import openpyxl

# 年级范围
grade_ranges = [111, 112, 113, 121, 122, 123, 131, 132, 133, 211, 212, 213, 221, 222, 223, 231, 232, 233, 311, 312, 313, 321, 322, 323, 331, 332, 333]
# 小学年级范围
primary_grades = [1, 2, 3, 4, 5, 6]

# 生成Excel文件
for gr in grade_ranges:
    for grade in primary_grades:
        file_name = f"{gr}{grade}年级学习计划done.xlsx"
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "年级计划"
        
        # 填充表格内容
        ws.append([f"{gr}{grade}年级"])
        
        # 保存Excel文件
        wb.save(file_name)

print("所有表格已生成完毕！")

