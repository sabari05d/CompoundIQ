import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stockId = parseInt(id, 10);

    if (!stockId || isNaN(stockId)) {
      return NextResponse.json({ error: 'Invalid stock ID' }, { status: 400 });
    }

    // Fetch stock data
    const { data: stock, error: stockError } = await supabase
      .from('stocks')
      .select('*')
      .eq('id', stockId)
      .single();

    if (stockError || !stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    // Build context for the LLM
    const metrics = {
      name: stock.name,
      ticker: stock.ticker,
      cmp: stock.cmp,
      pe: stock.pe,
      market_cap_cr: stock.market_cap_cr,
      roce: stock.roce,
      profit_var_3yrs: stock.profit_var_3yrs,
      sales_var_3yrs: stock.sales_var_3yrs,
      qtr_profit_var: stock.qtr_profit_var,
      qtr_sales_var: stock.qtr_sales_var,
      div_yield: stock.div_yield,
    };

    // Try to call Claude API (Anthropic)
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (anthropicKey) {
      return await callAnthropic(anthropicKey, metrics);
    } else if (openaiKey) {
      return await callOpenAI(openaiKey, metrics);
    } else {
      // Fallback: rule-based analysis using only the available metrics
      return NextResponse.json(generateRuleBasedAnalysis(metrics));
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

function buildPrompt(metrics: any): string {
  return `You are a value-investing analyst. Analyze this Indian stock for a long-term investor looking for multibagger returns (3-5 year horizon).

Stock metrics:
- Company: ${metrics.name}${metrics.ticker ? ` (${metrics.ticker})` : ''}
- Current Market Price: ${metrics.cmp ?? 'N/A'}
- P/E Ratio: ${metrics.pe ?? 'N/A'}
- Market Cap: ${metrics.market_cap_cr ?? 'N/A'} Cr
- ROCE: ${metrics.roce ?? 'N/A'}%
- 3-Year Sales Growth: ${metrics.sales_var_3yrs ?? 'N/A'}%
- 3-Year Profit Growth: ${metrics.profit_var_3yrs ?? 'N/A'}%
- Quarterly Profit Variation: ${metrics.qtr_profit_var ?? 'N/A'}%
- Quarterly Sales Variation: ${metrics.qtr_sales_var ?? 'N/A'}%
- Dividend Yield: ${metrics.div_yield ?? 'N/A'}%

Provide analysis in this JSON format only (no markdown, no extra text):
{
  "bull_thesis": "3-4 concise bullet-style reasons supporting investment, each ~25 words",
  "base_case": "Expected 3-year scenario. Revenue growth, ROCE, valuation, target price if calculable. ~50 words.",
  "bear_case": "Key risks. Competition, valuation risk, margin compression, etc. ~50 words.",
  "break_conditions": "Specific triggers that would invalidate the thesis (e.g. ROCE falls below X%, debt/equity rises above Y)",
  "confidence_score": 3,
  "summary": "One-line investment thesis in 15 words or less"
}

Be honest about uncertainty. If a metric is missing, factor that into your confidence score (lower confidence when data is limited). Confidence: 1 (very low) to 5 (very high).`;
}

async function callAnthropic(apiKey: string, metrics: any) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: buildPrompt(metrics),
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return NextResponse.json(
      { error: `Anthropic API error: ${errText}` },
      { status: 500 }
    );
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  return parseAndReturn(text, metrics);
}

async function callOpenAI(apiKey: string, metrics: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: 'You are a value-investing analyst. Output valid JSON only.' },
        { role: 'user', content: buildPrompt(metrics) },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: `OpenAI API error: ${await response.text()}` },
      { status: 500 }
    );
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  return parseAndReturn(text, metrics);
}

function parseAndReturn(text: string, metrics: any) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Could not parse model response as JSON', raw: text },
        { status: 500 }
      );
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      ...parsed,
      source: 'llm',
      generated_at: new Date().toISOString(),
      metrics_used: metrics,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'JSON parse failed', raw: text },
      { status: 500 }
    );
  }
}

function generateRuleBasedAnalysis(metrics: any) {
  const positives: string[] = [];
  const negatives: string[] = [];

  if (metrics.roce !== null) {
    if (metrics.roce >= 20) positives.push(`Strong ROCE of ${metrics.roce.toFixed(1)}% indicates excellent capital efficiency.`);
    else if (metrics.roce >= 15) positives.push(`Good ROCE of ${metrics.roce.toFixed(1)}% shows above-average capital efficiency.`);
    else if (metrics.roce < 12) negatives.push(`Weak ROCE of ${metrics.roce.toFixed(1)}% is below the 12% benchmark.`);
  }

  if (metrics.profit_var_3yrs !== null) {
    if (metrics.profit_var_3yrs >= 25) positives.push(`Exceptional 3Y profit CAGR of ${metrics.profit_var_3yrs.toFixed(1)}%.`);
    else if (metrics.profit_var_3yrs >= 15) positives.push(`Solid 3Y profit growth of ${metrics.profit_var_3yrs.toFixed(1)}%.`);
    else if (metrics.profit_var_3yrs < 0) negatives.push(`3Y profit has declined (${metrics.profit_var_3yrs.toFixed(1)}%).`);
  }

  if (metrics.sales_var_3yrs !== null) {
    if (metrics.sales_var_3yrs >= 15) positives.push(`3Y sales growth of ${metrics.sales_var_3yrs.toFixed(1)}% is healthy.`);
    else if (metrics.sales_var_3yrs < 10) negatives.push(`Slow 3Y sales growth of ${metrics.sales_var_3yrs.toFixed(1)}%.`);
  }

  if (metrics.qtr_profit_var !== null) {
    if (metrics.qtr_profit_var < 0) negatives.push(`Quarterly profit declined ${Math.abs(metrics.qtr_profit_var).toFixed(1)}% YoY.`);
  }

  if (metrics.pe !== null) {
    if (metrics.pe > 30) negatives.push(`P/E of ${metrics.pe.toFixed(1)} may indicate overvaluation.`);
    else if (metrics.pe < 15) positives.push(`Reasonable P/E of ${metrics.pe.toFixed(1)} offers margin of safety.`);
  }

  if (metrics.market_cap_cr !== null && metrics.market_cap_cr < 500) {
    negatives.push(`Small market cap of ₹${metrics.market_cap_cr} Cr means higher volatility.`);
  }

  const hasPositives = positives.length > 0;
  const hasNegatives = negatives.length > 0;
  const confidenceScore = Math.min(5, Math.max(1, Math.round(positives.length - negatives.length / 2) + 2));

  return {
    source: 'rule-based',
    generated_at: new Date().toISOString(),
    metrics_used: metrics,
    bull_thesis: hasPositives
      ? positives.join(' ')
      : 'No strong positive signals from current metrics. Manual research recommended.',
    base_case: `If fundamentals hold, modest growth in line with historical rates (${metrics.profit_var_3yrs?.toFixed(0) || 'unknown'}% profit CAGR). Target returns depend on valuation entry and broader market conditions.`,
    bear_case: hasNegatives
      ? negatives.join(' ')
      : 'Limited information available. Key risks: macro slowdown, sector headwinds, management execution.',
    break_conditions: [
      metrics.roce !== null ? `ROCE falls below ${Math.max(10, metrics.roce * 0.7).toFixed(0)}%` : 'No ROCE data to set threshold',
      'Quarterly profit declines for 2+ consecutive quarters',
      'Management integrity concerns or major governance issues',
    ].join('\n'),
    confidence_score: confidenceScore,
    summary: hasPositives
      ? `Watchlist candidate with ${positives.length} positive signal(s). Verify with deeper research.`
      : 'Mixed signals. Manual research strongly recommended.',
  };
}