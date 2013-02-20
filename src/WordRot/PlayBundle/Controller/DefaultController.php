<?php

namespace WordRot\PlayBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Security\Core\SecurityContext;

class DefaultController extends Controller
{
    private function getWordnikUser()
    {
        $Wordnik = $this->get('word_rot_play.wordnik');
        $User = $Wordnik->getUser();
        if(is_null($User)) {
            $UserInfo = $Wordnik->authenticate('freen','Yuquh4Ka');
            $User = $Wordnik->getUser();
        }
        return $User;
    }

    public function indexAction()
    {
    	$Wordnik = $this->get('word_rot_play.wordnik');
    	$WordLists = $Wordnik->getWordLists();
        return $this->render('WordRotPlayBundle:Default:index.html.twig', array(
        	// 'user' => $this->getWordnikUser()
        ));
    }

    public function loginAction()
    {
        $request = $this->getRequest();
        $session = $request->getSession();

        // get the login error if there is one
        if ($request->attributes->has(SecurityContext::AUTHENTICATION_ERROR)) {
            $error = $request->attributes->get(
                SecurityContext::AUTHENTICATION_ERROR
            );
        } else {
            $error = $session->get(SecurityContext::AUTHENTICATION_ERROR);
            $session->remove(SecurityContext::AUTHENTICATION_ERROR);
        }

        return $this->render('WordRotPlayBundle:Default:login.html.twig', array(
            // last username entered by the user
            'last_username' => $session->get(SecurityContext::LAST_USERNAME),
            'error'         => $error,
        ));
    }
}