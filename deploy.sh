#!/bin/bash
# 百信活动工坊 - 一键部署脚本
# 适用于 Linux/macOS 系统

set -e

echo "🚀 开始部署百信活动工坊..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
        echo "Ubuntu: sudo apt-get install docker.io docker-compose"
        echo "macOS: brew install docker docker-compose"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose 未安装${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker 和 Docker Compose 已安装${NC}"
}

# 检查端口占用
check_ports() {
    local ports=("3000" "5173" "5432" "6379")
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            echo -e "${YELLOW}⚠️  端口 $port 被占用，请确认是否需要关闭其他服务${NC}"
        fi
    done
}

# 配置环境变量
setup_env() {
    echo ""
    echo "📝 配置环境变量..."
    
    if [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✅ 创建 backend/.env${NC}"
    else
        echo -e "${YELLOW}⚠️  backend/.env 已存在，跳过${NC}"
    fi
    
    # 生成 JWT_SECRET
    if ! grep -q "JWT_SECRET.*openssl" backend/.env; then
        echo "JWT_SECRET=\"$(openssl rand -hex 32)\"" >> backend/.env
        echo -e "${GREEN}✅ 生成 JWT_SECRET${NC}"
    fi
    
    # 设置生产环境
    if ! grep -q "NODE_ENV=production" backend/.env; then
        echo "NODE_ENV=production" >> backend/.env
        echo -e "${GREEN}✅ 设置 NODE_ENV=production${NC}"
    fi
}

# 启动服务
start_services() {
    echo ""
    echo "🐳 启动 Docker 服务..."
    docker-compose up -d
    
    echo ""
    echo "⏳ 等待服务启动..."
    sleep 15
    
    # 检查服务状态
    echo ""
    echo "📊 服务状态:"
    docker-compose ps
}

# 初始化数据库
init_database() {
    echo ""
    echo "🗄️  初始化数据库..."
    
    # 等待 PostgreSQL 就绪
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U baixin > /dev/null 2>&1; then
            echo -e "${GREEN}✅ PostgreSQL 已就绪${NC}"
            break
        fi
        echo "等待 PostgreSQL 启动... ($i/30)"
        sleep 2
    done
    
    # 执行数据库迁移
    echo "执行 Prisma 迁移..."
    docker-compose exec -T backend npm run prisma:migrate || {
        echo -e "${YELLOW}⚠️  数据库迁移失败，可手动执行：docker-compose exec backend npm run prisma:migrate${NC}"
    }
    
    # 生成 Prisma 客户端
    echo "生成 Prisma 客户端..."
    docker-compose exec -T backend npm run prisma:generate || {
        echo -e "${YELLOW}⚠️  Prisma 生成失败，可手动执行：docker-compose exec backend npm run prisma:generate${NC}"
    }
}

# 显示访问信息
show_info() {
    echo ""
    echo "========================================"
    echo -e "${GREEN}✅ 部署完成！${NC}"
    echo "========================================"
    echo ""
    echo "📍 访问地址:"
    echo "   前端：http://localhost:5173"
    echo "   后端 API: http://localhost:3000"
    echo "   API 文档：http://localhost:3000/api-docs"
    echo ""
    echo "📊 服务状态:"
    echo "   docker-compose ps"
    echo ""
    echo "📝 查看日志:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 停止服务:"
    echo "   docker-compose down"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    check_docker
    check_ports
    setup_env
    start_services
    init_database
    show_info
}

# 运行主函数
main
