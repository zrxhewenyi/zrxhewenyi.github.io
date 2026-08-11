---
title: 示例文章：ACT 算法学习笔记
date: 2026-05-20
tags: [具身智能, 学习笔记]
summary: 一篇演示博客系统全部能力的示例文章，包含代码块、表格与列表。正式使用时可删除并替换为真实文章。
---

> 本文是博客系统的示例文章，用于演示 Markdown 渲染效果：标题、列表、代码块、表格、链接与图片均支持。正式使用时请删除本文件并在 `posts/index.json` 中移除对应记录。

## ACT 是什么

ACT（Action Chunking with Transformers）是一种基于 Transformer 的机器人操作策略学习方法。它的核心思想是**动作分块**：不是预测单个动作，而是预测一段动作序列，从而降低高频控制的累积误差。

## 核心要点

1. 动作分块（Action Chunking）：一次预测 k 步动作
2. 条件变分自编码器（CVAE）建模多峰动作分布
3. 贪心搜索挑选执行轨迹（实际实现中简化为固定采样）

## 代码骨架

```python
import torch
import torch.nn as nn

class ACTPolicy(nn.Module):
    def __init__(self, obs_dim, action_dim, chunk_size):
        super().__init__()
        self.action_dim = action_dim
        self.chunk_size = chunk_size
        self.encoder = nn.Linear(obs_dim, 256)
        self.decoder = nn.Linear(256, action_dim * chunk_size)

    def forward(self, obs):
        # obs: (B, obs_dim) -> 动作分块 (B, chunk_size, action_dim)
        z = torch.relu(self.encoder(obs))
        return self.decoder(z).view(-1, self.chunk_size, self.action_dim)
```

## 对比一览

| 方法 | 预测粒度 | 是否用 Transformer | 适用场景 |
|---|---|---|---|
| ACT | 动作分块 | 是 | 精细操作任务 |
| Diffusion Policy | 动作分布 | 是 | 多峰动作分布 |
| BC（行为克隆） | 单步动作 | 否 | 基础任务 |

## 参考

- 论文：[Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware](https://arxiv.org/abs/2304.13705)
- 官方代码：[tonyzhaozh/act](https://github.com/tonyzhaozh/act)

本示例中的代码仅为演示语法，并非真实实现。
