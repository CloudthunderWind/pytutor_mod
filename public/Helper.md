## 开发帮助日志

[TOC]

### 目前trace.json的结构

- code // 描述代码相关信息，可以在后端进行配置
  - main_code 源代码
  - custom_modules 自定义模块
  - helper 帮助信息
- trace // 一个对象数组，用来描述每行代码执行后运行时堆栈的变化
  - line 代码所在行
  - event 事件类型
    - step_line 步骤行
    - call 函数调用
    - return 返回值
  - func_name 当前代码所在的函数名称
    - \<module> 不在任何函数中
  - file_name 当前代码所在的文件名称
    - \<string> 不在任何文件中
  - globals 全局声明，包括类、函数、变量等的声明以及它们对堆栈的引用关系
    - field : ["REF", symbolNum]
  - ordered_globals 排序全局声明，只包含对类、函数、变量等声明的名称
  - stack_to_render 需要渲染的栈状态（暂时不重要）
  - **heap** 需要渲染的堆状态（按照声明顺序）
    - symbolNum 引用符标识
      - type [INSTANCE|CLASS|FUNCTION] 堆块中数据类型
      - fieldName field类型
      - ...relations/properties 关系和属性列表
        - [subFieldName，["REF", symbolNum]|null]
  - stdout 标准输出流

