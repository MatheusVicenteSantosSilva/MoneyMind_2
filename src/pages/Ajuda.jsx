import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const Ajuda = () => {
  return (
    <>
      <Helmet>
        <title>Ajuda - MoneyMind</title>
        <meta name="description" content="Página de ajuda do MoneyMind. Reporte problemas ou entre em contato com a empresa." />
      </Helmet>

      <div className="min-h-screen p-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-white mb-6">Ajuda</h1>
          <p className="text-gray-300 mb-4">
            Se você está enfrentando algum problema ou deseja entrar em contato com a MoneyMind, envie um e-mail para:
          </p>
          <a
            href="mailto:contato.moneymind@gmail.com"
            className="text-blue-400 underline"
          >
            contato.moneymind@gmail.com
          </a>
        </motion.div>
      </div>
    </>
  );
};

export default Ajuda;
