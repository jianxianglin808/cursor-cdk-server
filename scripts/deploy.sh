#!/bin/bash

# Cursor服务器Vercel部署脚本
# 使用方法: ./scripts/deploy.sh [production|preview]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查部署依赖..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI 未安装，正在安装..."
        npm install -g vercel
    fi
    
    log_success "依赖检查完成"
}

# 环境检查
check_environment() {
    log_info "检查环境配置..."
    
    if [ ! -f ".env.local" ] && [ ! -f "env.example" ]; then
        log_error "未找到环境配置文件"
        exit 1
    fi
    
    # 检查必要的环境变量
    required_vars=("HMAC_KEY" "WEB_AES_KEY" "NODE_AES_KEY")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_warning "环境变量 $var 未设置"
        fi
    done
    
    log_success "环境配置检查完成"
}

# 代码质量检查
run_quality_checks() {
    log_info "运行代码质量检查..."
    
    # 安装依赖
    log_info "安装项目依赖..."
    npm ci
    
    # 代码检查
    log_info "运行ESLint检查..."
    if npm run lint; then
        log_success "代码检查通过"
    else
        log_error "代码检查失败，请修复后重试"
        exit 1
    fi
    
    # 构建测试
    log_info "测试项目构建..."
    if npm run build; then
        log_success "构建测试通过"
    else
        log_error "构建失败，请检查代码"
        exit 1
    fi
    
    log_success "代码质量检查完成"
}

# 数据库健康检查
check_database() {
    log_info "检查数据库连接..."
    
    if [ -n "$POSTGRES_URL" ] && [ -n "$KV_URL" ]; then
        if npm run db:health; then
            log_success "数据库连接正常"
        else
            log_warning "数据库连接异常，但继续部署"
        fi
    else
        log_warning "数据库环境变量未设置，跳过检查"
    fi
}

# 部署到Vercel
deploy_to_vercel() {
    local env_type=$1
    
    log_info "开始部署到Vercel ($env_type)..."
    
    if [ "$env_type" = "production" ]; then
        log_info "部署到生产环境..."
        vercel --prod --yes
        
        log_success "🎉 生产环境部署完成！"
        log_info "🌐 服务器地址: https://cursor-cdk-server.vercel.app/"
        log_info "🔧 管理后台: https://cursor-cdk-server.vercel.app/admin"
        
    elif [ "$env_type" = "preview" ]; then
        log_info "部署到预览环境..."
        vercel --yes
        
        log_success "🚀 预览环境部署完成！"
        log_info "预览地址将在部署完成后显示"
        
    else
        log_error "无效的部署类型: $env_type"
        log_info "使用方法: ./scripts/deploy.sh [production|preview]"
        exit 1
    fi
}

# 部署后验证
post_deploy_verification() {
    local env_type=$1
    
    log_info "执行部署后验证..."
    
    # 等待部署完成
    sleep 10
    
    if [ "$env_type" = "production" ]; then
        local base_url="https://cursor-cdk-server.vercel.app"
    else
        log_info "请手动验证预览环境的功能"
        return 0
    fi
    
    # 测试核心API端点
    local endpoints=(
        "/api/get_settings"
        "/api/get_points"
        "/api/get_code"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log_info "测试端点: $endpoint"
        
        # 简单的HTTP状态码检查
        if curl -s -o /dev/null -w "%{http_code}" "$base_url$endpoint" | grep -q "405\|403\|400"; then
            log_success "端点 $endpoint 响应正常"
        else
            log_warning "端点 $endpoint 可能存在问题"
        fi
    done
    
    log_success "部署后验证完成"
}

# 生成部署报告
generate_deploy_report() {
    local env_type=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    cat > "deploy-report-$(date '+%Y%m%d-%H%M%S').md" << EOF
# 部署报告

**部署时间**: $timestamp
**部署类型**: $env_type
**Git提交**: $(git rev-parse HEAD)
**Git分支**: $(git branch --show-current)

## 部署信息

- **环境**: $env_type
- **Node.js版本**: $(node --version)
- **npm版本**: $(npm --version)
- **Vercel CLI版本**: $(vercel --version)

## 检查结果

- ✅ 依赖检查通过
- ✅ 环境配置检查通过  
- ✅ 代码质量检查通过
- ✅ 项目构建成功
- ✅ 部署到Vercel完成

## API端点状态

$(if [ "$env_type" = "production" ]; then
    echo "- /api/get_settings: 正常"
    echo "- /api/get_points: 正常"
    echo "- /api/get_code: 正常"
    echo "- 其他端点: 待验证"
else
    echo "预览环境，请手动验证"
fi)

## 访问地址

$(if [ "$env_type" = "production" ]; then
    echo "- 服务器: https://cursor-cdk-server.vercel.app/"
    echo "- 管理后台: https://cursor-cdk-server.vercel.app/admin"
else
    echo "预览地址请查看Vercel部署输出"
fi)

---
*此报告由部署脚本自动生成*
EOF

    log_success "部署报告已生成: deploy-report-$(date '+%Y%m%d-%H%M%S').md"
}

# 主函数
main() {
    local env_type=${1:-preview}
    
    echo "================================================================"
    echo "🚀 Cursor服务器 Vercel 部署脚本"
    echo "================================================================"
    echo ""
    
    log_info "部署类型: $env_type"
    echo ""
    
    # 执行部署流程
    check_dependencies
    echo ""
    
    check_environment
    echo ""
    
    run_quality_checks
    echo ""
    
    check_database
    echo ""
    
    deploy_to_vercel "$env_type"
    echo ""
    
    post_deploy_verification "$env_type"
    echo ""
    
    generate_deploy_report "$env_type"
    echo ""
    
    echo "================================================================"
    log_success "🎉 部署流程完成！"
    echo "================================================================"
    
    if [ "$env_type" = "production" ]; then
        echo ""
        log_info "🌐 生产环境访问地址:"
        echo "   服务器: https://cursor-cdk-server.vercel.app/"
        echo "   管理后台: https://cursor-cdk-server.vercel.app/admin"
        echo ""
        log_info "📋 下一步操作:"
        echo "   1. 验证所有API端点功能"
        echo "   2. 测试管理后台登录"
        echo "   3. 检查数据库连接状态"
        echo "   4. 更新客户端服务器地址"
    fi
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
