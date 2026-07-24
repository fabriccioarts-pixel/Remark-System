import { useState, useRef } from 'react'
import { useCRM } from '../../store'

const PRESETS = ['5%', '10%', '15%', '20%', '25%', '30%']

export const DEFAULT_MSG_ANIVERSARIO = "Oi, {nome}! Tudo bem? 🥰\n\nVimos aqui que o mês do seu aniversário chegou e não poderíamos deixar de te mandar uma mensagem! A equipe da *Natuclinic* te deseja um novo ciclo lindo, cheio de saúde, leveza e momentos especiais.\n\nE claro, a gente queria te dar um mimo para comemorar! Preparamos um *voucher exclusivo* pra você:\n\n✨ *{desconto} de desconto* em qualquer procedimento estético do nosso espaço.\n\nÉ só usar o código: *{codigo}*\n\nEle vale pro mês todo, viu? Aproveite bastante o seu dia!\n\nCom carinho,\n_Equipe Natuclinic_ 💛"

export const DEFAULT_MSG_LIMPEZA = "Oi, {nome}! Parabéns pelo seu dia! 🎉\n\nNós da *Natuclinic* te desejamos um ano maravilhoso, cheio de saúde e muita alegria.\n\nPra deixar essa data ainda mais especial e você comemorar com aquela pele linda, queremos te convidar para fazer sua *Limpeza de Pele* com a gente.\n\nComo é seu aniversário, deixamos um presente reservado pra você: *{desconto} de desconto* na sua sessão!\n\nPra garantir, é só usar o código: *{codigo}*\n\nMe avisa se quiser já deixar seu horário marcadinho? Um beijo grande de toda a equipe! 💆‍♀️✨\n\n_Equipe Natuclinic_ 💛"

export function VoucherConfigModal() {
  const { voucherConfig, saveVoucherConfig, closeModal, showToast } = useCRM()
  const [selected, setSelected] = useState(PRESETS.includes(voucherConfig.discount) ? voucherConfig.discount : '')
  const [msgType, setMsgType] = useState<'aniversario' | 'limpeza'>(voucherConfig.msgType || 'aniversario')
  const [msgAniversario, setMsgAniversario] = useState(voucherConfig.msgAniversario || DEFAULT_MSG_ANIVERSARIO)
  const [msgLimpeza, setMsgLimpeza] = useState(voucherConfig.msgLimpeza || DEFAULT_MSG_LIMPEZA)
  
  const customRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    const custom = customRef.current?.value.trim()
    const final = custom || selected || voucherConfig.discount
    saveVoucherConfig({ 
      discount: final,
      msgType,
      msgAniversario,
      msgLimpeza
    })
    closeModal()
    showToast('Configurações salvas!')
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <div className="modal-title" style={{ marginBottom: 18 }}>Configurar Mensagem de Aniversário</div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, color: 'var(--txt2)', fontWeight: 600, marginBottom: 6 }}>PERCENTUAL DE DESCONTO</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map(d => (
            <button key={d} onClick={() => { setSelected(d); if (customRef.current) customRef.current.value = '' }}
              style={{ padding: '7px 14px', background: 'var(--surf3)', border: `1px solid ${selected === d ? 'var(--gold)' : 'var(--bord)'}`, borderRadius: 7, cursor: 'pointer', color: selected === d ? 'var(--gold)' : 'var(--txt2)', fontSize: 13, fontWeight: 600 }}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11.5, color: 'var(--txt2)', fontWeight: 600, marginBottom: 6 }}>OU VALOR PERSONALIZADO</div>
        <input ref={customRef}
          defaultValue={!PRESETS.includes(voucherConfig.discount) ? voucherConfig.discount : ''}
          placeholder="Ex: 50 reais, Consulta grátis..."
          onChange={() => setSelected('')}
          style={{ width: '100%', background: 'var(--surf3)', border: '1px solid var(--bord2)', borderRadius: 7, padding: '8px 11px', color: 'var(--txt)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11.5, color: 'var(--txt2)', fontWeight: 600, marginBottom: 6 }}>MODELO DE MENSAGEM</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button onClick={() => setMsgType('aniversario')}
            style={{ flex: 1, padding: '7px 14px', background: 'var(--surf3)', border: `1px solid ${msgType === 'aniversario' ? 'var(--gold)' : 'var(--bord)'}`, borderRadius: 7, cursor: 'pointer', color: msgType === 'aniversario' ? 'var(--gold)' : 'var(--txt2)', fontSize: 13, fontWeight: 600 }}>
            Feliz Aniversário
          </button>
          <button onClick={() => setMsgType('limpeza')}
            style={{ flex: 1, padding: '7px 14px', background: 'var(--surf3)', border: `1px solid ${msgType === 'limpeza' ? 'var(--gold)' : 'var(--bord)'}`, borderRadius: 7, cursor: 'pointer', color: msgType === 'limpeza' ? 'var(--gold)' : 'var(--txt2)', fontSize: 13, fontWeight: 600 }}>
            Follow up Limpeza
          </button>
        </div>
        <textarea 
          value={msgType === 'aniversario' ? msgAniversario : msgLimpeza}
          onChange={(e) => msgType === 'aniversario' ? setMsgAniversario(e.target.value) : setMsgLimpeza(e.target.value)}
          style={{ width: '100%', height: 160, background: 'var(--surf3)', border: '1px solid var(--bord2)', borderRadius: 7, padding: '8px 11px', color: 'var(--txt)', fontSize: 12.5, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }} 
        />
        <div style={{ fontSize: 10.5, color: 'var(--txt3)', marginTop: 4 }}>
          Variáveis: <b style={{ color: 'var(--txt2)' }}>{'{nome}'}</b>, <b style={{ color: 'var(--txt2)' }}>{'{desconto}'}</b>, <b style={{ color: 'var(--txt2)' }}>{'{codigo}'}</b>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSave} className="btn btn-wa" style={{ flex: 1, justifyContent: 'center' }}>Salvar Configurações</button>
        <button onClick={closeModal} style={{ padding: '8px 14px', background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 7, cursor: 'pointer', color: 'var(--txt2)' }}>Cancelar</button>
      </div>
    </div>
  )
}
