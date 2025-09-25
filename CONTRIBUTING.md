# 🤝 贡献指南

感谢您对 Cursor插件100%兼容云端服务器 项目的关注！我们欢迎各种形式的贡献。

## 📋 **贡献方式**

### **🐛 报告Bug**
- 使用 [Bug Report 模板](https://github.com/yourusername/cursor-server-vercel/issues/new?template=bug_report.md)
- 提供详细的重现步骤
- 包含环境信息和错误日志

### **✨ 功能建议**
- 使用 [Feature Request 模板](https://github.com/yourusername/cursor-server-vercel/issues/new?template=feature_request.md)
- 描述使用场景和预期收益
- 考虑向后兼容性

### **📝 文档改进**
- 修复文档中的错误
- 添加使用示例
- 翻译文档到其他语言

### **💻 代码贡献**
- 修复已知问题
- 实现新功能
- 优化性能
- 改进测试覆盖

## 🚀 **开始贡献**

### **1. 设置开发环境**

```bash
# 1. Fork 项目到你的 GitHub 账号
# 2. 克隆你的 fork
git clone https://github.com/yourusername/cursor-server-vercel.git
cd cursor-server-vercel

# 3. 安装依赖
npm install

# 4. 配置环境变量
cp env.example .env.local
# 编辑 .env.local 配置开发环境

# 5. 初始化数据库 (可选)
npm run db:init

# 6. 启动开发服务器
npm run dev
```

### **2. 创建分支**

```bash
# 从 main 分支创建新分支
git checkout -b feature/your-feature-name
# 或
git checkout -b bugfix/issue-number
```

### **3. 开发和测试**

```bash
# 运行代码检查
npm run lint

# 运行构建
npm run build

# 数据库健康检查
npm run db:health
```

### **4. 提交代码**

```bash
# 添加变更
git add .

# 提交 (使用规范的提交信息)
git commit -m "feat: add new feature description"

# 推送到你的 fork
git push origin feature/your-feature-name
```

### **5. 创建 Pull Request**

- 访问你的 fork 页面
- 点击 "New Pull Request"
- 填写 PR 模板
- 等待代码审查

## 📝 **代码规范**

### **🎨 代码风格**

#### **JavaScript/Node.js**
```javascript
// ✅ 好的示例
export class ApiHandler {
  static async handleRequest(req, res) {
    try {
      const { timestamp, sign } = req.body;
      
      if (!this.verifySignature(req)) {
        return res.status(403).json({
          success: false,
          message: '签名验证失败'
        });
      }
      
      // 处理业务逻辑
      const result = await this.processRequest(req.body);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('API处理错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}
```

#### **React组件**
```jsx
// ✅ 好的示例
import React, { useState, useEffect } from 'react';
import './Component.css';

export default function Component({ prop1, prop2 }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 副作用逻辑
  }, [prop1]);

  const handleAction = async () => {
    setLoading(true);
    try {
      // 处理逻辑
    } catch (error) {
      console.error('操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      {/* JSX内容 */}
    </div>
  );
}
```

### **📋 命名规范**

#### **文件命名**
- API路由: `kebab-case.js` (例如: `get-settings.js`)
- React组件: `PascalCase.jsx` (例如: `KeysManager.jsx`)
- 工具脚本: `kebab-case.js` (例如: `health-check.js`)
- 样式文件: `PascalCase.css` (例如: `KeysManager.css`)

#### **变量命名**
```javascript
// ✅ 好的示例
const userDevice = 'device123';
const cdkActivationTime = Date.now();
const API_BASE_URL = 'https://api.example.com';

// ❌ 不好的示例
const ud = 'device123';
const t = Date.now();
const url = 'https://api.example.com';
```

#### **函数命名**
```javascript
// ✅ 好的示例
async function activateCDK(cdkCode) { }
function verifySignature(params) { }
function generateNonce() { }

// ❌ 不好的示例  
async function activate(code) { }
function verify(p) { }
function gen() { }
```

### **🔐 安全要求**

#### **敏感信息处理**
```javascript
// ✅ 好的示例
const HMAC_KEY = process.env.HMAC_KEY;
if (!HMAC_KEY) {
  throw new Error('HMAC_KEY environment variable is required');
}

// ❌ 不好的示例
const HMAC_KEY = '9c5f66da591ea9f793959ec358abe1c14989d13642dcd92272e9f02a9811993e';
```

#### **输入验证**
```javascript
// ✅ 好的示例
function validateCDK(cdk) {
  if (!cdk || typeof cdk !== 'string') {
    throw new Error('CDK必须是非空字符串');
  }
  
  if (!/^[A-Z]+-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/.test(cdk)) {
    throw new Error('CDK格式无效');
  }
  
  return true;
}

// ❌ 不好的示例
function validateCDK(cdk) {
  return true; // 没有验证
}
```

### **📊 数据库操作**

#### **查询规范**
```javascript
// ✅ 好的示例
async function getCDKInfo(cdkCode) {
  try {
    const result = await DatabaseManager.query(
      'SELECT * FROM cdks WHERE cdk_code = $1 AND status = $2',
      [cdkCode, 'ACTIVATED']
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('CDK查询失败:', error);
    throw error;
  }
}

// ❌ 不好的示例
async function getCDKInfo(cdkCode) {
  const result = await DatabaseManager.query(
    `SELECT * FROM cdks WHERE cdk_code = '${cdkCode}'` // SQL注入风险
  );
  return result.rows[0];
}
```

## 🧪 **测试要求**

### **📋 测试类型**

#### **单元测试**
```javascript
// 测试API端点逻辑
describe('CDK激活API', () => {
  test('应该成功激活有效的CDK', async () => {
    const mockReq = {
      body: {
        cdk: 'WEEKPRO-TEST-0001-DEMO',
        timestamp: Date.now(),
        device_code: 'test-device'
      }
    };
    
    const mockRes = {
      json: jest.fn(),
      status: jest.fn(() => mockRes)
    };
    
    await activateHandler(mockReq, mockRes);
    
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true
      })
    );
  });
});
```

#### **集成测试**
```javascript
// 测试完整的API流程
describe('API集成测试', () => {
  test('完整的CDK激活流程', async () => {
    // 1. 创建测试CDK
    // 2. 调用激活API
    // 3. 验证数据库状态
    // 4. 清理测试数据
  });
});
```

### **🔍 测试覆盖率**
- 核心业务逻辑: ≥ 90%
- API端点: ≥ 80%
- 工具函数: ≥ 85%

## 📋 **提交信息规范**

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### **📝 提交类型**
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具链更新

### **💡 提交示例**
```bash
# 新功能
git commit -m "feat(api): add CDK batch activation endpoint"

# Bug修复
git commit -m "fix(auth): resolve JWT token expiration issue"

# 文档更新
git commit -m "docs: update API documentation for get_points endpoint"

# 代码重构
git commit -m "refactor(database): optimize CDK query performance"
```

## 📊 **PR审查流程**

### **🔍 自检清单**
提交PR前请确认：

- [ ] 代码通过所有检查 (`npm run lint`)
- [ ] 构建成功 (`npm run build`)
- [ ] 测试通过 (如果有)
- [ ] 文档已更新
- [ ] 提交信息规范
- [ ] 分支名称清晰

### **👥 审查标准**

#### **代码质量**
- 逻辑清晰，易于理解
- 错误处理完善
- 性能考虑合理
- 安全性无问题

#### **兼容性**
- API向后兼容
- 数据库变更安全
- 不破坏现有功能

#### **文档**
- 代码注释充分
- API文档更新
- README更新 (如需要)

### **⚡ 审查时间**
- 小型PR (< 100行): 1-2天
- 中型PR (100-500行): 2-5天  
- 大型PR (> 500行): 5-10天

## 🎯 **优先级指南**

### **🔴 高优先级**
- 安全漏洞修复
- 核心功能Bug
- 性能严重问题
- API兼容性问题

### **🟡 中优先级**
- 新功能开发
- 用户体验改进
- 文档完善
- 测试补充

### **🟢 低优先级**
- 代码重构
- 工具链优化
- 非核心功能
- 样式调整

## 💬 **沟通渠道**

### **📧 联系方式**
- **GitHub Issues**: 技术问题和功能建议
- **GitHub Discussions**: 一般讨论和问答
- **Email**: support@example.com (紧急问题)

### **📅 会议**
- **周例会**: 每周三 10:00 (项目进展讨论)
- **技术分享**: 每月最后一个周五 (技术交流)

## 🏆 **贡献者认可**

### **🎖️ 贡献类型**
- **代码贡献者**: 提交代码PR
- **文档贡献者**: 改进文档
- **测试贡献者**: 补充测试用例
- **问题报告者**: 报告有效Bug
- **社区维护者**: 帮助其他贡献者

### **🎁 奖励机制**
- 贡献者列表展示
- 特别感谢在Release Notes中提及
- 优秀贡献者邀请成为维护者

## 📚 **学习资源**

### **📖 技术文档**
- [Next.js 文档](https://nextjs.org/docs)
- [Vercel 部署指南](https://vercel.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [JWT 标准](https://tools.ietf.org/html/rfc7519)

### **🔐 安全最佳实践**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js 安全检查清单](https://blog.risingstack.com/node-js-security-checklist/)

### **🧪 测试框架**
- [Jest 测试框架](https://jestjs.io/docs/getting-started)
- [Supertest API测试](https://github.com/visionmedia/supertest)

---

**🙏 再次感谢您的贡献！让我们一起构建更好的Cursor插件服务器！**
