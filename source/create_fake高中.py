import openpyxl

# 年级范围
grade_ranges = [111]
# 小学年级范围
primary_grades = [1]

# 生成Excel文件
for gr in grade_ranges:
    for grade in primary_grades:
        file_name = f"高中学习计划done.xlsx"
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "年级计划"
        
        # 填充表格内容
        ws.append([f"高中"])
        
        # 保存Excel文件
        wb.save(file_name)

print("所有表格已生成完毕！")

